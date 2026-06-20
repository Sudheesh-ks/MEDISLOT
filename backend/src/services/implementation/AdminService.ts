import { IAdminRepository } from '../../repositories/interface/IAdminRepository';
import { IAdminService } from '../interface/IAdminService';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/Jwt.utils';
import { sendDoctorRejectionEmail } from '../../utils/Mail.util';
import { DoctorDTO } from '../../dtos/Doctor.dto';
import { UserDTO } from '../../dtos/User.dto';
import { toUserDTO } from '../../mappers/User.mapper';
import { AdminDTO } from '../../dtos/Admin.dto';
import { toAdminDTO } from '../../mappers/Admin.mapper';
import { PaginationResult } from '../../types/Pagination';
import { HttpResponse } from '../../constants/ResponseMessage.constants';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { IFeedbackRepository } from '../../repositories/interface/IFeedbackRepository';
import { ioInstance } from '../../sockets/ChatSocket';
import { ComplaintDTO } from '../../dtos/Complaint.dto';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { tocomplaintDTO } from '../../mappers/Complaint.mapper';
import { toDoctorDTO } from '../../mappers/Doctor.mapper';
import { WalletTypes } from '../../types/Wallet';
import { IAppointmentRepository } from '../../repositories/interface/IAppointmentRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
dotenv.config();

export class AdminService implements IAdminService {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _feedbackRepository: IFeedbackRepository,
    private readonly _complaintRepository: IComplaintRepository,
    private readonly _appointmentRepository: IAppointmentRepository
  ) {}

  async login(
    email?: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!email || !password) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
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
    const doctor = await this._doctorRepository.findDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'approved') throw new Error('Doctor already approved');

    doctor.status = 'approved';
    await this._doctorRepository.saveDoctorData(doctor);
    return 'Doctor approved successfully';
  }

  async rejectDoctor(doctorId: string, reason?: string): Promise<string> {
    const doctor = await this._doctorRepository.findDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'rejected') throw new Error('Doctor already rejected');

    doctor.status = 'rejected';
    if (reason) doctor.rejectionReason = reason;
    await Promise.all([
      this._doctorRepository.saveDoctorData(doctor),
      sendDoctorRejectionEmail(doctor.email, doctor.name, reason).catch(console.error),
    ]);

    return 'Doctor rejected and notified by email';
  }

  async blockDoctor(doctorId: string, reason?: string): Promise<string> {
    const doctor = await this._doctorRepository.findDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'blocked') throw new Error('Doctor already blocked');

    doctor.status = 'blocked';
    if (reason) doctor.rejectionReason = reason;
    await this._doctorRepository.saveDoctorData(doctor);

    sendDoctorRejectionEmail(doctor.email, doctor.name, reason).catch((err) =>
      console.error('Doctor blocking email failed:', err)
    );

    const today = new Date().toISOString().split('T')[0];

    const appointments = await this._appointmentRepository.findUpcomingAppointmentsByDoctorId(
      doctorId,
      today
    );

    await Promise.all(
      appointments.map((appt) => this._appointmentRepository.cancelAppointment(appt._id.toString()))
    );

    return 'Doctor rejected and notified by email';
  }

  async unBlockDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');
    if (doctor.status === 'approved') throw new Error('Doctor already approved');

    doctor.status = 'approved';
    await this._doctorRepository.saveDoctorData(doctor);

    return 'Doctor unblocked';
  }

  async getDoctors(): Promise<DoctorDTO[]> {
    return await this._doctorRepository.getAllDoctors();
  }

  async getDoctorById(id: string): Promise<DoctorDTO | null> {
    const doctor = await this._doctorRepository.findDoctorById(id);
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

    const result = await this._doctorRepository.getDoctorsPaginated(
      pageNumber,
      limitNumber,
      search
    );

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

    const result = await this._userRepository.getUsersPaginated(pageNumber, limitNumber, search);

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
    const users = await this._userRepository.getAllUsers();
    return users.map(toUserDTO);
  }

  async toggleUserBlock(userId: string, block: boolean): Promise<UserDTO> {
    if (typeof block !== 'boolean') {
      throw new Error(HttpResponse.BLOCK_STATUS_INVALID);
    }

    const user = await this._userRepository.toggleUserBlock(userId, block);

    if (!user) {
      throw new Error('User not found');
    }

    if (block) {
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
                title: 'Account blocked by admin',
                link: '/system',
              })
            )
          : Promise.resolve(),
      ]);
    }

    return toUserDTO(user);
  }

  async getAdminWalletPaginated(
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all',
    startDate?: string,
    endDate?: string
  ): Promise<{
    history: WalletTypes[];
    total: number;
    balance: number;
    filteredCredits: number;
    filteredDebits: number;
  }> {
    const adminId = process.env.ADMIN_ID;
    if (!adminId) throw new Error('ADMIN_ID is not set in environment');

    return await this._walletRepository.getWalletHistoryPaginated(
      adminId,
      'admin',
      page,
      limit,
      search,
      period,
      txnType,
      startDate,
      endDate
    );
  }

  async getLatestDoctorRequests(limit = 5): Promise<DoctorDTO[]> {
    const requests = await this._doctorRepository.getLatestDoctorRequests(limit);
    return requests.map((doctor) => doctor as DoctorDTO);
  }

  async getTopDoctors(
    limit = 5
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]> {
    return await this._appointmentRepository.getTopDoctorsByAppointments(limit);
  }

  async getRevenueStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; revenue: number }[]> {
    return await this._appointmentRepository.getAdminRevenueFromAppointments(startDate, endDate);
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
