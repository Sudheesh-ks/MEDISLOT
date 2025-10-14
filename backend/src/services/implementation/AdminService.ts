import { IAdminRepository } from '../../repositories/interface/IAdminRepository';
import { IAdminService } from '../interface/IAdminService';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { sendDoctorRejectionEmail } from '../../utils/mail.util';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { UserDTO } from '../../dtos/user.dto';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { toUserDTO } from '../../mappers/user.mapper';
import { toAppointmentDTO } from '../../mappers/appointment.mapper';
import { AdminDTO } from '../../dtos/admin.dto';
import { toAdminDTO } from '../../mappers/admin.mapper';
import { PaginationResult } from '../../types/pagination';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { IFeedbackRepository } from '../../repositories/interface/IFeedbackRepository';
import { ioInstance } from '../../sockets/ChatSocket';
import { ComplaintDTO } from '../../dtos/complaint.dto';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { tocomplaintDTO } from '../../mappers/complaint.mapper';
import { toDoctorDTO } from '../../mappers/doctor.mapper';
import { generateShortAppointmentId } from '../../utils/generateApptId.utils';
import appointmentModel from '../../models/appointmentModel';
import { WalletTypes } from '../../types/wallet';
dotenv.config();

export class AdminService implements IAdminService {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _feedbackRepository: IFeedbackRepository,
    private readonly _complaintRepository: IComplaintRepository
  ) {}

  async login(
    email?: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!email || !password) {
      throw new Error(HttpResponse.ADMIN_FIELDS_REQUIRED);
    }

    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error(HttpResponse.INVALID_CREDENTIALS);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error(HttpResponse.INCORRECT_PASSWORD);

    const accessToken = generateAccessToken(admin._id.toString(), admin.email, 'admin');
    const refreshToken = generateRefreshToken(admin._id.toString());

    return { accessToken, refreshToken };
  }

  async refreshAdminToken(refreshToken?: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      throw new Error(HttpResponse.REFRESH_TOKEN_INVALID);
    }

    const admin = await this._adminRepository.findAdminById(decoded.id);
    if (!admin) throw new Error('Admin not found');

    const newAccessToken = generateAccessToken(admin._id.toString(), admin.email, 'admin');
    const newRefreshToken = generateRefreshToken(admin._id.toString());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getAdminById(id: string): Promise<AdminDTO | null> {
    const admin = await this._adminRepository.findAdminById(id);
    return admin ? toAdminDTO(admin) : null;
  }

  async validateCredentials(email: string, password: string): Promise<AdminDTO> {
    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error('Admin not found');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return toAdminDTO(admin);
  }

  async approveDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'approved') throw new Error('Doctor already approved');

    doctor.status = 'approved';
    await this._doctorRepository.save(doctor);
    return 'Doctor approved successfully';
  }

  async rejectDoctor(doctorId: string, reason?: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'rejected') throw new Error('Doctor already rejected');

    doctor.status = 'rejected';
    if (reason) doctor.rejectionReason = reason;
    await Promise.all([
      this._doctorRepository.save(doctor),
      sendDoctorRejectionEmail(doctor.email, doctor.name, reason).catch(console.error),
    ]);

    return 'Doctor rejected and notified by email';
  }

  async blockDoctor(doctorId: string, reason?: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'blocked') throw new Error('Doctor already blocked');

    doctor.status = 'blocked';
    if (reason) doctor.rejectionReason = reason;
    await this._doctorRepository.save(doctor);

    sendDoctorRejectionEmail(doctor.email, doctor.name, reason).catch((err) =>
      console.error('Doctor blocking email failed:', err)
    );

    const today = new Date().toISOString().split('T')[0];

    const appointments = await appointmentModel.find({
      docId: doctorId,
      slotDate: { $gte: today },
      cancelled: false,
    });

    await Promise.all(appointments.map((appt) => this.cancelAppointment(appt._id.toString())));

    return 'Doctor rejected and notified by email';
  }

  async unBlockDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'approved') throw new Error('Doctor already approved');

    doctor.status = 'approved';
    await this._doctorRepository.save(doctor);

    return 'Doctor unblocked';
  }

  async getDoctors(): Promise<DoctorDTO[]> {
    return await this._adminRepository.getAllDoctors();
  }

  async getDoctorById(id: string): Promise<DoctorDTO | null> {
    const doctor = await this._doctorRepository.getDoctorProfileById(id);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    return toDoctorDTO(doctor);
  }

  async getDoctorsPaginated(
    page: string,
    limit: string,
    search: string
  ): Promise<PaginationResult<DoctorDTO>> {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;

    const result = await this._adminRepository.getDoctorsPaginated(pageNumber, limitNumber, search);

    return {
      data: result.data.map(toDoctorDTO),
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async getUsersPaginated(
    page: string,
    limit: string,
    search?: string
  ): Promise<PaginationResult<UserDTO>> {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;

    const result = await this._adminRepository.getUsersPaginated(pageNumber, limitNumber, search);

    return {
      data: result.data.map(toUserDTO),
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async getUsers(): Promise<UserDTO[]> {
    const users = await this._adminRepository.getAllUsers();
    return users.map(toUserDTO);
  }

  async toggleUserBlock(userId: string, block: boolean): Promise<UserDTO> {
    if (typeof block !== 'boolean') {
      throw new Error(HttpResponse.BLOCK_STATUS_INVALID);
    }

    // await this._notificationService.sendNotification({
    //   recipientId: userId,
    //   recipientRole: 'user',
    //   type: 'system',
    //   title: 'You have been blocked',
    //   message: 'Your account has been blocked by the Admin.',
    // });

    // if (ioInstance) {
    //   ioInstance.to(userId).emit('notification', {
    //     title: 'Accound blocked by admin',
    //     link: '/system',
    //   });
    // }

    await Promise.all([
      this._notificationService.sendNotification({
        recipientId: userId,
        recipientRole: 'user',
        type: 'system',
        title: 'You have been blocked',
        message: 'Your account has been blocked by the Admin.',
      }),
      ioInstance
        ? Promise.resolve(
            ioInstance.to(userId).emit('notification', {
              title: 'Accound blocked by admin',
              link: '/system',
            })
          )
        : Promise.resolve(),
    ]);

    const user = await this._adminRepository.toggleUserBlock(userId);
    return toUserDTO(user);
  }

  async listAppointments(): Promise<AppointmentDTO[]> {
    const appointments = await this._adminRepository.getAllAppointments();
    return appointments.map(toAppointmentDTO);
  }

  async listAppointmentsPaginated(
    page: number,
    limit: number,
    search: string,
    dateRange: string
  ): Promise<PaginationResult<AppointmentDTO>> {
    const result = await this._adminRepository.getAppointmentsPaginated(
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

  async cancelAppointment(appointmentId: string): Promise<void> {
    if (!appointmentId) throw new Error('Missing required fields');

    const appointment = await this._adminRepository.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error('Cancellation Failed');
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const adminId = process.env.ADMIN_ID;
    const userId = appointment.userData._id.toString();
    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.docData.name}`;

    // console.log(adminId);
    // console.log(doctorId);
    // console.log(uId)

    // await this._walletRepository.creditWallet(userId, 'user', amount, reason);

    const doctorShare = amount * 0.8;
    // await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason);

    const adminShare = amount * 0.2;
    // await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason);

    // await this._notificationService.sendNotification({
    //   recipientId: doctorId,
    //   recipientRole: 'doctor',
    //   type: 'appointment',
    //   title: 'Appointment Canceled by Admin',
    //   message: `Admin canceled your appointment with ${appointment.userData.name}. ₹${doctorShare} refunded to user from your wallet.`,
    //   link: '/doctor/appointments',
    // });

    // if (ioInstance) {
    //   ioInstance.to(doctorId).emit('notification', {
    //     title: 'Appointment cancelled by Admin',
    //     link: '/doctor/appointments',
    //   });
    // }

    // await this._notificationService.sendNotification({
    //   recipientId: userId,
    //   recipientRole: 'user',
    //   type: 'appointment',
    //   title: 'Appointment Canceled by Admin',
    //   message: `Admin canceled your appointment with ${appointment.docData.name}. ₹${amount} refunded to your wallet.`,
    //   link: '/appointments',
    // });

    // if (ioInstance) {
    //   ioInstance.to(userId).emit('notification', {
    //     title: 'Appointment cancelled by Admin',
    //     link: '/appointments',
    //   });
    // }

    // await this._adminRepository.cancelAppointment(appointmentId);

    await Promise.all([
      this._walletRepository.creditWallet(userId, 'user', amount, reason),
      this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason),
      this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason),
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
      ioInstance
        ? Promise.resolve(
            ioInstance.to(doctorId).emit('notification', {
              title: 'Appointment cancelled by Admin',
              link: '/doctor/appointments',
            })
          )
        : Promise.resolve(),
      ioInstance
        ? Promise.resolve(
            ioInstance.to(userId).emit('notification', {
              title: 'Appointment cancelled by Admin',
              link: '/appointments',
            })
          )
        : Promise.resolve(),
      this._adminRepository.cancelAppointment(appointmentId),
    ]);
  }

  async getAdminWalletPaginated(
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all'
  ): Promise<{ history: WalletTypes[]; total: number; balance: number }> {
    const adminId = process.env.ADMIN_ID;
    if (!adminId) throw new Error('ADMIN_ID is not set in environment');

    return await this._walletRepository.getWalletHistoryPaginated(
      adminId,
      'admin',
      page,
      limit,
      search,
      period,
      txnType
    );
  }

  async getLatestDoctorRequests(limit = 5): Promise<DoctorDTO[]> {
    const requests = await this._adminRepository.getLatestDoctorRequests(limit);
    return requests.map((doctor) => doctor as DoctorDTO);
  }

  async getAppointmentsStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; count: number }[]> {
    return await this._adminRepository.getAppointmentsStats(startDate, endDate);
  }

  async getTopDoctors(
    limit = 5
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]> {
    return await this._adminRepository.getTopDoctors(limit);
  }

  async getRevenueStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; revenue: number }[]> {
    return await this._adminRepository.getRevenueStats(startDate, endDate);
  }

  async getAllComplaints(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = 'all'
  ): Promise<{ complaints: ComplaintDTO[]; totalPages: number; currentPage: number }> {
    const [complaintDocs, total] = await Promise.all([
      this._complaintRepository.getComplaints(page, limit, search, status),
      this._complaintRepository.countComplaints(search, status),
    ]);

    return {
      complaints: complaintDocs.map(tocomplaintDTO),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async updateComplainStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  ): Promise<ComplaintDTO | null> {
    const complaint = await this._complaintRepository.findComplaintById(id);
    const userId = complaint?.userId?.toString();
    const doctorId = complaint?.doctorId?.toString();
    const updated = await this._complaintRepository.updateComplaintStatus(id, status);

    if (!updated) {
      throw new Error('Complaint not found');
    }

    const recipientId = userId || doctorId;
    const recipientRole = userId ? 'user' : 'doctor';

    // await this._notificationService.sendNotification({
    //   recipientId,
    //   recipientRole,
    //   type: 'system',
    //   title: 'Admin updation on your complaint',
    //   message: `Admin switched your complaint status to ${status}`,
    //   link: '/system',
    // });

    // if (ioInstance) {
    //   ioInstance.to(userId!).emit('notification', {
    //     title: 'Admin updation on your complaint',
    //     link: '/system',
    //   });
    // }

    await Promise.all([
      this._notificationService.sendNotification({
        recipientId,
        recipientRole,
        type: 'system',
        title: 'Admin updation on your complaint',
        message: `Admin switched your complaint status to ${status}`,
        link: '/system',
      }),
      ioInstance
        ? Promise.resolve(
            ioInstance.to(userId!).emit('notification', {
              title: 'Admin updation on your complaint',
              link: '/system',
            })
          )
        : Promise.resolve(),
    ]);
    return tocomplaintDTO(updated);
  }
}
