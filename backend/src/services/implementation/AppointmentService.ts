import mongoose from 'mongoose';
import { AppointmentDTO } from '../../dtos/Appointment.dto';
import { toAppointmentDTO } from '../../mappers/Appointment.mapper';
import { IAppointmentRepository } from '../../repositories/interface/IAppointmentRepository';
import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import { ISlotRepository } from '../../repositories/interface/ISlotRepository';
import { ITempAppointmentRepository } from '../../repositories/interface/ITempAppointmentRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { notifyActiveAppointment } from '../../sockets/ActiveAppointmentSocket';
import { AppointmentTypes } from '../../types/Appointment';
import { PaginationResult } from '../../types/Pagination';
import { RazorpayOrderDTO } from '../../types/Payment';
import { generateShortAppointmentId } from '../../utils/GenerateApptId.utils';
import { IAppointmentService } from '../interface/IAppointmentService';
import { INotificationService } from '../interface/INotificationService';
import { IPaymentService } from '../interface/IPaymentService';
import { ioInstance } from '../../sockets/ChatSocket';
import { ISlotService } from '../interface/ISlotService';
import { AppointmentDocument } from '../../models/AppointmentModel';

const adminId = process.env.ADMIN_ID;

export class AppointmentService implements IAppointmentService {
  constructor(
    private readonly _appointmentRepository: IAppointmentRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _tempAppointmentRepository: ITempAppointmentRepository,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _paymentService: IPaymentService,
    private readonly _slotService: ISlotService
  ) {}
  async initiateBooking({
    userId,
    docId,
    slotDate,
    slotStartTime,
    slotEndTime,
    patientDetails,
  }: {
    userId: string;
    docId: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
    patientDetails: {
      name: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      height?: string;
      weight?: string;
      problemDescription: string;
      vitals?: {
        temperature?: string;
        bloodPressure?: string;
        heartRate?: string;
      };
    };
  }): Promise<{ lockExpiresAt: Date; order: RazorpayOrderDTO; tempBookingId: string }> {
    if (!userId || !docId || !slotDate || !slotStartTime || !slotEndTime || !patientDetails) {
      console.log('Missing fields:', {
        userId,
        docId,
        slotDate,
        slotStartTime,
        slotEndTime,
        patientDetails,
      });
      throw new Error('All fields are required');
    }
    console.log('InitiateBooking received patientDetails:', JSON.stringify(patientDetails));

    const existingTempAppointment = await this._tempAppointmentRepository.findActiveTempAppointment(
      docId,
      slotDate,
      slotStartTime,
      slotEndTime
    );

    if (existingTempAppointment) {
      throw new Error('Slot temporarily unavailable - another user is booking this slot');
    }

    const realSlotDoc = await this._slotRepository.getSlotByDate(docId, slotDate);
    if (realSlotDoc) {
      const isAlreadyBooked = realSlotDoc.slots.some(
        (s) => s.start === slotStartTime && s.end === slotEndTime && s.booked
      );
      if (isAlreadyBooked) {
        throw new Error('Slot already booked');
      }
    }

    const [user, doctor] = await Promise.all([
      this._userRepository.findUserById(userId),
      this._doctorRepository.findDoctorById(docId),
    ]);

    if (!user) throw new Error('User not found');
    if (!doctor) throw new Error('Doctor not found');

    const amountInPaise = doctor.fees * 100;
    if (!amountInPaise || amountInPaise <= 0) {
      throw new Error('Invalid appointment amount');
    }

    const order = await this._paymentService.createOrder(amountInPaise, `temp_${Date.now()}`);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const tempAppointmentData = {
      userId,
      docId,
      slotDate,
      slotStartTime,
      slotEndTime,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      razorpayOrderId: order.id,
      status: 'pending_payment' as const,
      expiresAt,
      patientDetails,
    };

    const tempAppointment =
      await this._tempAppointmentRepository.createTempAppointment(tempAppointmentData);

    console.log(`Temporary appointment created: ${tempAppointment._id}`);
    console.log(`Expires at: ${expiresAt}`);

    return {
      lockExpiresAt: expiresAt,
      order,
      tempBookingId: tempAppointment._id.toString(),
    };
  }

  async getUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filterType?: 'all' | 'upcoming' | 'ended'
  ): Promise<PaginationResult<AppointmentDTO>> {
    const paginatedData = await this._appointmentRepository.findUserAppointments(
      userId,
      page,
      limit,
      filterType
    );

    return {
      ...paginatedData,
      data: paginatedData.data.map(toAppointmentDTO),
    };
  }

  async getActiveUserAppointment(userId: string): Promise<AppointmentDTO | null> {
    if (!userId) throw new Error('User not found');

    const appointment = await this._appointmentRepository.findActiveUserAppointment(userId);

    if (
      appointment &&
      appointment.isConfirmed === true &&
      appointment.cancelled === false &&
      appointment.payment === true
    ) {
      const now = new Date();
      const start = new Date(`${appointment.slotDate}T${appointment.slotStartTime}:00`);
      const end = new Date(`${appointment.slotDate}T${appointment.slotEndTime}:00`);

      if (now >= start && now <= end) {
        await notifyActiveAppointment(appointment);
        return toAppointmentDTO(appointment);
      }
    }

    return null;
  }

  async cancelAppointmentByUser(userId: string, appointmentId: string): Promise<void> {
    if (!userId || !appointmentId) throw new Error('Missing required details');

    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized cancellation');
    }

    if (!appointment.payment) {
      await this._appointmentRepository.cancelAppointment(appointmentId);
      return;
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.docData.name}`;

    const doctorShare = amount * 0.8;
    const adminShare = amount * 0.2;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await this._walletRepository.creditWallet(
          userId.toString(),
          'user',
          amount,
          reason,
          session
        );
        await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason, session);
        await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason, session);
        await this._appointmentRepository.cancelAppointment(appointmentId, session);
        await this._slotRepository.unbookSlot(
          appointment.docId.toString(),
          appointment.slotDate,
          appointment.slotStartTime,
          appointment.slotEndTime,
          session
        );
        await this._slotService.releaseSlotLock(
          doctorId,
          appointment.slotDate,
          appointment.slotStartTime,
          appointment.slotEndTime,
          userId,
          session
        );
      });
    } catch (error) {
      console.error('Cancel appointment by user transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }

    // Run notifications asynchronously after transaction commits successfully
    Promise.all([
      this._notificationService.sendNotification({
        recipientId: doctorId,
        recipientRole: 'doctor',
        type: 'appointment',
        title: 'Appointment Canceled',
        message: `User ${appointment.userData.name} canceled the appointment. ₹${doctorShare} refunded to user from your wallet.`,
        link: '/doctor/appointments',
      }),
      this._notificationService.sendNotification({
        recipientId: adminId,
        recipientRole: 'admin',
        type: 'appointment',
        title: 'Appointment Canceled by User',
        message: `Appointment between ${appointment.userData.name} and ${appointment.docData.name} was canceled. ₹${adminShare} refunded to user from your wallet.`,
        link: '/admin/appointments',
      }),
    ]).catch((err) => console.error('Failed to send cancellation notifications:', err));

    if (ioInstance) {
      ioInstance.to(doctorId).emit('notification', {
        title: `Appointment cancelled by ${appointment.userData.name}`,
        link: '/doctor/appointments',
      });
    }
  }

  async startPayment(userId: string, appointmentId: string): Promise<{ order: RazorpayOrderDTO }> {
    if (!userId || !appointmentId) {
      throw new Error('User ID and Appointment ID are required');
    }

    const appointment = await this._appointmentRepository.findPayableAppointment(appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (appointment.cancelled) {
      throw new Error('Appointment cancelled');
    }

    if (appointment.payment) {
      throw new Error('Appointment already paid');
    }

    const amountInPaise = appointment.amount * 100;

    const order = await this._paymentService.createOrder(amountInPaise, appointment._id.toString());

    return { order };
  }

  async verifyPayment(
    userId: string,
    tempBookingId: string,
    razorpay_order_id: string
  ): Promise<AppointmentDTO> {
    const tempAppointment =
      await this._tempAppointmentRepository.findTempAppointmentById(tempBookingId);
    if (!tempAppointment) {
      throw new Error('Temporary appointment not found or expired');
    }

    if (tempAppointment.expiresAt < new Date()) {
      throw new Error('Temporary appointment has expired');
    }
    console.log(
      'VerifyPayment found tempAppointment:',
      JSON.stringify(tempAppointment.patientDetails)
    );

    if (tempAppointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized access to temporary appointment');
    }

    const orderInfo = await this._paymentService.fetchOrder(razorpay_order_id);
    if (orderInfo.status !== 'paid') {
      throw new Error('Payment not completed');
    }

    if (orderInfo.id !== tempAppointment.razorpayOrderId) {
      throw new Error('Order ID mismatch');
    }

    const appointmentData: AppointmentTypes = {
      userId: tempAppointment.userId,
      docId: tempAppointment.docId,
      slotDate: tempAppointment.slotDate,
      slotStartTime: tempAppointment.slotStartTime,
      slotEndTime: tempAppointment.slotEndTime,
      userData: tempAppointment.userData,
      docData: tempAppointment.docData,
      amount: tempAppointment.amount,
      date: Date.now(),
      payment: true,
      patientDetails: tempAppointment.patientDetails as any,
    };

    const session = await mongoose.startSession();
    let booked: AppointmentDocument;
    try {
      await session.withTransaction(async () => {
        booked = await this.bookAppointment(appointmentData, session);
        await this._appointmentRepository.markAppointmentPaid(booked._id.toString(), session);

        const amount = booked.amount;
        const doctorId = booked.docData._id.toString();
        const doctorShare = amount * 0.8;
        const adminShare = amount * 0.2;

        await this._walletRepository.creditWallet(
          doctorId,
          'doctor',
          doctorShare,
          `Earnings for Appointment ${generateShortAppointmentId(booked._id.toString())}`,
          session
        );

        await this._walletRepository.creditWallet(
          adminId!,
          'admin',
          adminShare,
          `Commission for Appointment ${generateShortAppointmentId(booked._id.toString())}`,
          session
        );

        await this._slotRepository.markSlotBooked(
          tempAppointment.docId,
          tempAppointment.slotDate,
          tempAppointment.slotStartTime,
          tempAppointment.slotEndTime,
          session
        );

        await this._tempAppointmentRepository.deleteTempAppointment(tempBookingId, session);
      });
    } catch (error) {
      console.error('Booking payment verification transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }

    console.log(`Appointment created successfully: ${booked!._id}`);
    console.log(`Temporary appointment cleaned up: ${tempBookingId}`);

    return toAppointmentDTO(booked!);
  }

  async bookAppointment(data: AppointmentTypes, session?: any): Promise<AppointmentDocument> {
    const doctor = await this._doctorRepository.findDoctorById(data.docId);
    if (!doctor || !doctor.available) {
      throw new Error('Doctor unavailable for booking');
    }

    const user = await this._userRepository.findUserById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this._slotService.reserveSlotForAppointment(
      data.docId,
      data.slotDate,
      data.slotStartTime,
      data.slotEndTime,
      session
    );

    const appointment = await this._appointmentRepository.createAppointment(
      {
        ...data,
        userData: user,
        docData: doctor,
        amount: doctor.fees,
      },
      session
    );

    return appointment;
  }

  async cancelTempBooking(tempBookingId: string): Promise<any> {
    console.log(`Attempting to cancel temp booking: ${tempBookingId}`);

    const tempAppointment =
      await this._tempAppointmentRepository.findTempAppointmentById(tempBookingId);

    if (!tempAppointment) {
      console.log('No temp appointment found');
      return;
    }

    console.log('Temp appointment data:', {
      id: tempAppointment._id,
      userId: tempAppointment.userId,
      docId: tempAppointment.docId,
      slotDate: tempAppointment.slotDate,
      slotStartTime: tempAppointment.slotStartTime,
      slotEndTime: tempAppointment.slotEndTime,
      status: tempAppointment.status,
      expiresAt: tempAppointment.expiresAt,
    });

    await this._tempAppointmentRepository.updateTempAppointmentStatus(tempBookingId, 'cancelled');
    await this._tempAppointmentRepository.deleteTempAppointment(tempBookingId);

    console.log('Temp appointment cancelled and deleted successfully');
  }

  async cleanupExpiredLocks(): Promise<void> {
    try {
      const deletedCount = await this._tempAppointmentRepository.cleanupExpiredTempAppointments();
      console.log(`Cleaned up ${deletedCount} expired temp appointments`);
    } catch (error) {
      console.error('Error cleaning up expired temp appointments:', error);
    }
  }

  async getAppointmentsByDoctorId(docId: string): Promise<AppointmentDTO[]> {
    if (!docId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findDoctorById(docId);
    if (!doctor) throw new Error('Doctor not found');

    const appointments = await this._appointmentRepository.findAppointmentsByDoctorId(docId);
    return appointments.map(toAppointmentDTO);
  }

  async getDoctorAppointments(
    docId: string,
    pageQuery: string,
    limitQuery: string,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDTO>> {
    if (!docId) throw new Error('Doctor ID is required');

    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 6;

    const paginatedData = await this._appointmentRepository.findDoctorAppointments(
      docId,
      page,
      limit,
      search,
      dateRange
    );

    return {
      ...paginatedData,
      data: paginatedData.data.map(toAppointmentDTO),
    };
  }

  async confirmAppointment(docId: string, appointmentId: string): Promise<void> {
    if (!docId || !appointmentId) throw new Error('Missing required fields');

    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error('Mark Failed');
    }

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();

    await Promise.all([
      this._notificationService.sendNotification({
        recipientId: userId,
        recipientRole: 'user',
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: `${appointment.docData.name} has confirmed your appointment.`,
        link: '/appointments',
      }),
      this._notificationService.sendNotification({
        recipientId: adminId,
        recipientRole: 'admin',
        type: 'appointment',
        title: 'Appointment Confirmed by Doctor',
        message: `${appointment.docData.name} confirmed appointment with ${appointment.userData.name}.`,
        link: '/admin/appointments',
      }),
      this._appointmentRepository.confirmAppointment(appointmentId),
    ]);
    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        title: `Appointment Confirmed by ${appointment.docData.name}`,
        link: '/appointments',
      });
    }
  }

  async cancelAppointmentByDoctor(docId: string, appointmentId: string): Promise<void> {
    if (!docId || !appointmentId) throw new Error('Missing required fields');

    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error('Cancellation Failed');
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();
    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.userData.name}`;

    const doctorShare = amount * 0.8;
    const adminShare = amount * 0.2;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await this._walletRepository.creditWallet(userId, 'user', amount, reason, session);
        await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason, session);
        await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason, session);
        await this._appointmentRepository.cancelAppointment(appointmentId, session);
        await this._slotRepository.unbookSlot(
          appointment.docId.toString(),
          appointment.slotDate,
          appointment.slotStartTime,
          appointment.slotEndTime,
          session
        );
      });
    } catch (error) {
      console.error('Cancel appointment by doctor transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }

    // Run notifications asynchronously after transaction commits successfully
    Promise.all([
      this._notificationService.sendNotification({
        recipientId: userId,
        recipientRole: 'user',
        type: 'appointment',
        title: 'Appointment Canceled by Doctor',
        message: `${appointment.docData.name} canceled your appointment. ₹${amount} refunded.`,
        link: '/appointments',
      }),
      this._notificationService.sendNotification({
        recipientId: adminId,
        recipientRole: 'admin',
        type: 'appointment',
        title: 'Doctor Canceled Appointment',
        message: `${appointment.docData.name} canceled the appointment with ${appointment.userData.name}. ₹${adminShare} refunded to user from your wallet.`,
        link: '/admin/appointments',
      }),
    ]).catch((err) => console.error('Failed to send cancellation notifications:', err));

    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        title: `Appointment Cancelled by ${appointment.docData.name}`,
        link: '/appointments',
      });
    }
  }

  async getActiveDoctorAppointments(docId: string): Promise<AppointmentDTO | null> {
    if (!docId) throw new Error('User not found');

    const appointment = await this._appointmentRepository.findActiveDoctorAppointment(docId);
    const active = appointment ? toAppointmentDTO(appointment) : null;

    if (active) {
      await notifyActiveAppointment(appointment);
    }
    return active;
  }

  async getAppointmentById(appointmentId: string): Promise<AppointmentDTO> {
    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new Error('appointment not found');
    return toAppointmentDTO(appointment);
  }

  async getAllAppointments(): Promise<AppointmentDTO[]> {
    const appointments = await this._appointmentRepository.getAllAppointments();
    return appointments.map(toAppointmentDTO);
  }

  async getAppointments(
    page: number,
    limit: number,
    search: string,
    dateRange: string
  ): Promise<PaginationResult<AppointmentDTO>> {
    const result = await this._appointmentRepository.getAppointments(
      page,
      limit,
      search,
      dateRange
    );

    return {
      data: result.data.map(toAppointmentDTO),
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async cancelAppointmentByAdmin(appointmentId: string): Promise<void> {
    if (!appointmentId) throw new Error('Missing required fields');

    const appointment = await this._appointmentRepository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error('Cancellation Failed');
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();
    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.userData.name}`;

    const doctorShare = amount * 0.8;
    const adminShare = amount * 0.2;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await this._walletRepository.creditWallet(userId, 'user', amount, reason, session);
        await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason, session);
        await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason, session);
        await this._appointmentRepository.cancelAppointment(appointmentId, session);
        await this._slotRepository.unbookSlot(
          appointment.docId.toString(),
          appointment.slotDate,
          appointment.slotStartTime,
          appointment.slotEndTime,
          session
        );
      });
    } catch (error) {
      console.error('Cancel appointment by admin transaction failed:', error);
      throw error;
    } finally {
      await session.endSession();
    }

    // Run notifications asynchronously after transaction commits successfully
    Promise.all([
      this._notificationService.sendNotification({
        recipientId: doctorId,
        recipientRole: 'doctor',
        type: 'appointment',
        title: 'Appointment Canceled by Admin',
        message: `Admin canceled your appointment with ${appointment.userData.name}. ₹${doctorShare} refunded to user from your wallet.`,
        link: '/doctor/appointments',
      }),
      this._notificationService.sendNotification({
        recipientId: userId,
        recipientRole: 'user',
        type: 'appointment',
        title: 'Appointment Canceled by Admin',
        message: `Admin canceled your appointment with ${appointment.docData.name}. ₹${amount} refunded to your wallet.`,
        link: '/appointments',
      }),
    ]).catch((err) => console.error('Failed to send cancellation notifications:', err));

    if (ioInstance) {
      try {
        ioInstance.to(doctorId).emit('notification', {
          title: 'Appointment cancelled by Admin',
          link: '/doctor/appointments',
        });
        ioInstance.to(userId).emit('notification', {
          title: 'Appointment cancelled by Admin',
          link: '/appointments',
        });
      } catch (err) {
        console.error('Socket notification emit failed:', err);
      }
    }
  }

  async getAppointmentsStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; count: number }[]> {
    return await this._appointmentRepository.getAppointmentsStats(startDate, endDate);
  }

  async autoCancelStaleAppointments(): Promise<void> {
    const staleAppointments = await this._appointmentRepository.findStaleAppointments();

    for (const appointment of staleAppointments) {
      try {
        await this.cancelAppointmentByAdmin(appointment._id.toString());

        console.log(`Auto-cancelled appointment ${appointment._id}`);
      } catch (error) {
        console.error(`Failed to cancel ${appointment._id}`, error);
      }
    }
  }
}
