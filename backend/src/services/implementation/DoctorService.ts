import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import bcrypt from 'bcrypt';
import { IDoctorService } from '../interface/IDoctorService';
import { DoctorTypes } from '../../types/doctor';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { toDoctorDTO } from '../../mappers/doctor.mapper';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { toAppointmentDTO } from '../../mappers/appointment.mapper';
import { PaginationResult } from '../../types/pagination';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { Types } from 'mongoose';
import { IPrescriptionRepository } from '../../repositories/interface/IPrescriptionRepository';
import { ioInstance } from '../../sockets/ChatSocket';
import { IPatientHistoryRepository } from '../../repositories/interface/IPatientHistoryRepository';
import { patientHistoryTypes } from '../../types/patientHistoryTypes';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { isValidPassword } from '../../utils/validator';
import { generateShortAppointmentId } from '../../utils/generateApptId.utils';
import { WalletHistory } from '../../types/wallet';
import { ComplaintDTO } from '../../dtos/complaint.dto';
import { tocomplaintDTO } from '../../mappers/complaint.mapper';
import { PrescriptionDTO } from '../../dtos/prescription.dto';
import { toPrescriptionDTO } from '../../mappers/prescription.mapper';

export interface DoctorDocument extends DoctorTypes {
  _id: string;
}

export class DoctorService implements IDoctorService {
  constructor(
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _prescriptionRepository: IPrescriptionRepository,
    private readonly _patientHistoryRepository: IPatientHistoryRepository,
    private readonly _complaintRepository: IComplaintRepository
  ) {}

  async registerDoctor(data: DoctorTypes): Promise<void> {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image,
      certificate,
    } = data;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !image ||
      !certificate
    ) {
      throw new Error('All Fields Required');
    }

    const existing = await this._doctorRepository.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = '';
    // const uploadResult = await cloudinary.uploader.upload(image, {
    //   resource_type: 'image',
    // });
    const [uploadResult, certificateUpload] = await Promise.all([
      cloudinary.uploader.upload(image, { resource_type: 'image', type: 'authenticated' }),
      cloudinary.uploader.upload(certificate, { resource_type: 'auto', type: 'authenticated' }),
    ]);

    imageUrl = uploadResult.public_id;

    // const certificateUpload = await cloudinary.uploader.upload(certificate, {
    //   resource_type: 'auto',
    // });

    const doctorData: DoctorTypes = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: imageUrl,
      certificate: certificateUpload.secure_url,
      date: new Date(),
      status: 'pending',
    };

    await this._doctorRepository.registerDoctor(doctorData);
  }

  async getPublicDoctorById(id: string): Promise<DoctorDTO> {
    if (!id) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.getDoctorProfileById(id);
    if (!doctor) throw new Error('Doctor not found');

    // ✅ Use the mapper that includes the Cloudinary signed URL logic
    return toDoctorDTO(doctor);
  }

  async toggleAvailability(docId: string): Promise<void> {
    if (!docId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error('Doctor not found');

    await this._doctorRepository.updateAvailability(docId, !doctor.available);
  }

  async getAllDoctors(): Promise<DoctorDTO[]> {
    const doctors = await this._doctorRepository.findAllDoctors();
    return doctors.map(toDoctorDTO);
  }

  async getDoctorsPaginated(query: any): Promise<PaginationResult<DoctorDTO>> {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 6;
    const search = query.search as string | undefined;
    const speciality = query.speciality as string | undefined;
    const minRating = query.minRating ? Number(query.minRating) : undefined;
    const sortOrder = query.sortOrder as string | undefined;

    const { data, totalCount, currentPage, totalPages, hasNextPage, hasPrevPage } =
      await this._doctorRepository.getDoctorsPaginated(
        page,
        limit,
        search,
        speciality,
        minRating,
        sortOrder
      );

    const mappedData = data.map(toDoctorDTO);

    return {
      data: mappedData,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async loginDoctor(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; refreshToken: string }> {
    const { email, password } = data;

    if (!email || !password) throw new Error('Email and password required');

    const doctor = await this._doctorRepository.findByEmail(email);
    if (!doctor) throw new Error(HttpResponse.INVALID_CREDENTIALS);

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) throw new Error(HttpResponse.INCORRECT_PASSWORD);

    const token = generateAccessToken(doctor._id!, doctor.email, 'doctor');
    const refreshToken = generateRefreshToken(doctor._id!);

    return { token, refreshToken };
  }

  async refreshToken(refreshToken?: string): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error(HttpResponse.REFRESH_TOKEN_FAILED);
    }

    const doctor = await this.getDoctorProfile(decoded.id);
    if (!doctor) throw new Error('Doctor not found');

    const newAccessToken = generateAccessToken(doctor._id!, doctor.email, 'doctor');
    const newRefreshToken = generateRefreshToken(doctor._id!);

    return { token: newAccessToken, refreshToken: newRefreshToken };
  }

  async getDoctorAppointments(docId: string): Promise<AppointmentDTO[]> {
    if (!docId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error('Doctor not found');

    const appointments = await this._doctorRepository.findAppointmentsByDoctorId(docId);
    return appointments.map(toAppointmentDTO);
  }

  async getDoctorAppointmentsPaginated(
    docId: string,
    pageQuery: string,
    limitQuery: string,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDTO>> {
    if (!docId) throw new Error('Doctor ID is required');

    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 6;

    const paginatedData = await this._doctorRepository.getAppointmentsPaginated(
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

    const appointment = await this._doctorRepository.findAppointmentById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error('Mark Failed');
    }

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();

    // await this._notificationService.sendNotification({
    //   recipientId: userId,
    //   recipientRole: 'user',
    //   type: 'appointment',
    //   title: 'Appointment Confirmed',
    //   message: `${appointment.docData.name} has confirmed your appointment.`,
    //   link: '/appointments',
    // });

    // if (ioInstance) {
    //   ioInstance.to(userId).emit('notification', {
    //     title: `Appointment Confirmed by ${appointment.docData.name}`,
    //     link: '/appointments',
    //   });
    // }

    // await this._notificationService.sendNotification({
    //   recipientId: adminId,
    //   recipientRole: 'admin',
    //   type: 'appointment',
    //   title: 'Appointment Confirmed by Doctor',
    //   message: `${appointment.docData.name} confirmed appointment with ${appointment.userData.name}.`,
    //   link: '/admin/appointments',
    // });

    // await this._doctorRepository.markAppointmentAsConfirmed(appointmentId);

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
      this._doctorRepository.markAppointmentAsConfirmed(appointmentId),
    ]);
    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        title: `Appointment Confirmed by ${appointment.docData.name}`,
        link: '/appointments',
      });
    }
  }

  async cancelAppointment(docId: string, appointmentId: string): Promise<void> {
    if (!docId || !appointmentId) throw new Error('Missing required fields');

    const appointment = await this._doctorRepository.findAppointmentById(appointmentId);
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error('Cancellation Failed');
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();
    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.docData.name}`;

    // await this._walletRepository.creditWallet(userId, 'user', amount, reason);

    const doctorShare = amount * 0.8;
    // await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason);

    const adminShare = amount * 0.2;
    // await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason);

    // await this._notificationService.sendNotification({
    //   recipientId: userId,
    //   recipientRole: 'user',
    //   type: 'appointment',
    //   title: 'Appointment Canceled by Doctor',
    //   message: `${appointment.docData.name} canceled your appointment. ₹${amount} refunded.`,
    //   link: '/appointments',
    // });

    // if (ioInstance) {
    //   ioInstance.to(userId).emit('notification', {
    //     title: `Appointment Cancelled by ${appointment.docData.name}`,
    //     link: '/appointments',
    //   });
    // }

    // await this._notificationService.sendNotification({
    //   recipientId: adminId,
    //   recipientRole: 'admin',
    //   type: 'appointment',
    //   title: 'Doctor Canceled Appointment',
    //   message: `${appointment.docData.name} canceled the appointment with ${appointment.userData.name}. ₹${adminShare} refunded to user from your wallet.`,
    //   link: '/admin/appointments',
    // });

    // await this._doctorRepository.cancelAppointment(appointmentId);

    await Promise.all([
      this._walletRepository.creditWallet(userId, 'user', amount, reason),
      this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason),
      this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason),
    ]);

    await Promise.all([
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
      this._doctorRepository.cancelAppointment(appointmentId),
    ]);

    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        title: `Appointment Cancelled by ${appointment.docData.name}`,
        link: '/appointments',
      });
    }
  }

  async getActiveAppointment(docId: string): Promise<AppointmentDTO | null> {
    if (!docId) throw new Error('User not found');

    const appointment = await this._doctorRepository.findActiveAppointment(docId);
    return appointment ? toAppointmentDTO(appointment) : null;
  }

  async getAppointmentById(appointmentId: string): Promise<AppointmentDTO> {
    const appointment = await this._userRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new Error('appointment not found');
    return toAppointmentDTO(appointment);
  }

  async getDoctorProfile(docId: string): Promise<DoctorDTO> {
    const doctor = await this._doctorRepository.getDoctorProfileById(docId);
    if (!doctor) throw new Error('Doctor not found');
    return toDoctorDTO(doctor);
  }

  async updateDoctorProfile(body: any, imageFile?: Express.Multer.File): Promise<void> {
    const { doctId, name, speciality, degree, experience, about, fees, address, available } = body;

    if (!doctId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findById(doctId);
    if (!doctor) throw new Error('Doctor not found');

    if (!name || typeof name !== 'string' || !name.trim()) throw new Error('Name is required');

    if (!speciality || !degree || !speciality.trim() || !degree.trim())
      throw new Error('Speciality and degree are required');

    const parsedExperience = parseInt(experience);
    if (isNaN(parsedExperience) || parsedExperience < 0)
      throw new Error('Experience must be a valid non-negative number');

    if (about && about.length > 500)
      throw new Error('About section is too long (max 500 characters)');

    const parsedFees = parseFloat(fees);
    if (isNaN(parsedFees) || parsedFees <= 0)
      throw new Error('Fees must be a valid number greater than 0');

    let parsedAddress;
    try {
      parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      if (
        !parsedAddress ||
        typeof parsedAddress !== 'object' ||
        !parsedAddress.line1?.trim() ||
        !parsedAddress.line2?.trim()
      ) {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      throw new Error('Address must include both line1 and line2');
    }

    let imageUrl = doctor.image;

    if (imageFile?.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          type: 'authenticated',
        });
        imageUrl = uploadResult.public_id;
        fs.unlink(imageFile.path, (err) => {
          if (err) console.error('Failed to delete local file:', err);
        });
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        throw new Error('Image upload failed');
      }
    }

    await this._doctorRepository.updateDoctorProfile(doctId, {
      name,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress,
      image: imageUrl,
      ...(available !== undefined && {
        available: String(available) === 'true',
      }),
    });
  }

  async changePassword(doctorId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const isMatch = await bcrypt.compare(oldPassword, doctor.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedpassword = await bcrypt.hash(newPassword, 10);

    await this._doctorRepository.updateDoctorById(doctorId, { password: hashedpassword });
  }

  async getDoctorWalletPaginated(
    doctorId: string,
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all'
  ): Promise<{ history: WalletHistory[]; total: number; balance: number }> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    return await this._walletRepository.getWalletHistoryPaginated(
      doctorId,
      'doctor',
      page,
      limit,
      search,
      period,
      txnType
    );
  }

  async getDashboardData(doctorId: string, startDate: string, endDate: string) {
    const [revenueData, appointmentData] = await Promise.all([
      this._doctorRepository.getRevenueOverTime(doctorId, startDate, endDate),
      this._doctorRepository.getAppointmentsOverTime(doctorId, startDate, endDate),
    ]);

    return {
      revenueData,
      appointmentData,
    };
  }

  async submitPrescription(
    doctorId: string,
    appointmentId: string,
    prescription: string
  ): Promise<PrescriptionDTO> {
    const appointment = await this._doctorRepository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const userId = appointment.userData._id.toString();

    await this._notificationService.sendNotification({
      recipientId: userId,
      recipientRole: 'user',
      type: 'appointment',
      title: 'Doctor added prescription',
      message: `${appointment.docData.name} has added prescription for your appointment(${appointment._id}).`,
      link: '/prescription',
    });

    if (ioInstance) {
      ioInstance.to(userId).emit('notification', {
        title: `Prescription added by ${appointment.docData.name}`,
        link: '/prescription',
      });
    }

    const createdPrescription = await this._prescriptionRepository.createPrescription({
      appointmentId: appointment._id,
      doctorId: new Types.ObjectId(doctorId),
      patientId: appointment.userData._id,
      prescription,
    });

    return toPrescriptionDTO(createdPrescription);
  }

  async createPatientHistory(data: patientHistoryTypes): Promise<void> {
    const patientHistory = {
      ...data,
      doctorId: new Types.ObjectId(data.doctorId),
      patientId: new Types.ObjectId(data.patientId),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(data.date);

    if (isNaN(inputDate.getTime()) || inputDate < today) {
      throw new Error('Invalid date: date cannot be in the past.');
    }

    if (
      !data.date?.toString().trim() ||
      !data.time?.trim() ||
      !data.type?.trim() ||
      !data.chiefComplaint?.trim() ||
      !data.diagnosis?.trim() ||
      !Array.isArray(data.symptoms) ||
      data.symptoms.length === 0 ||
      !data.vitals ||
      Object.values(data.vitals).every((v) => !v?.trim?.()) ||
      !Array.isArray(data.prescription) ||
      data.prescription.length === 0 ||
      data.prescription.some(
        (p) =>
          !p.medication?.trim() ||
          !p.dosage?.trim() ||
          !p.frequency?.trim() ||
          !p.duration?.trim() ||
          !p.instructions?.trim()
      )
    ) {
      throw new Error('All required fields must be filled.');
    }

    await this._patientHistoryRepository.createHistory(patientHistory);
  }

  async updatePatientHistory(
    historyId: string,
    data: Partial<patientHistoryTypes>
  ): Promise<patientHistoryTypes | null> {
    return this._patientHistoryRepository.updateHistory(historyId, data);
  }

  async getPatientHistory(doctorId: string, userId: string) {
    return await this._patientHistoryRepository.findByDoctorAndPatient(doctorId, userId);
  }

  async getPatientHistoryById(historyId: string) {
    return await this._patientHistoryRepository.findHistoryById(historyId);
  }

  async getPatientById(patientId: string) {
    return await this._userRepository.findUserById(patientId);
  }

  async reportIssue(doctorId: string, subject: string, description: string): Promise<ComplaintDTO> {
    if (!doctorId) {
      throw new Error('Unauthorized doctor');
    }

    if (!subject && !description) {
      throw new Error('Please provide the detailed issue');
    }

    const complaint = await this._complaintRepository.reportDoctorIssue(
      doctorId,
      subject,
      description
    );
    return tocomplaintDTO(complaint);
  }
}
