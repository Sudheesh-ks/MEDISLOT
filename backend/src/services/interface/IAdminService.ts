import { UserDTO } from '../../dtos/user.dto';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { DoctorTypes } from '../../types/doctor';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { AdminDTO } from '../../dtos/admin.dto';
import { PaginationResult } from '../../types/pagination';
import { ComplaintDTO } from '../../dtos/complaint.dto';

export interface DoctorInput extends DoctorTypes {
  imageFile?: Express.Multer.File;
}

export interface IAdminService {
  login(
    email?: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  refreshAdminToken(refreshToken?: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  getAdminById(id: string): Promise<AdminDTO | null>;
  validateCredentials(email: string, password: string): Promise<AdminDTO>;
  getDoctors(): Promise<DoctorDTO[]>;
  getDoctorsPaginated(page: string, limit: string): Promise<PaginationResult<DoctorDTO>>;
  getUsers(): Promise<UserDTO[]>;
  getUsersPaginated(page: string, limit: string): Promise<PaginationResult<UserDTO>>;
  toggleUserBlock(userId: string, block: boolean): Promise<UserDTO>;
  listAppointments(): Promise<AppointmentDTO[]>;
  listAppointmentsPaginated(page: number, limit: number): Promise<PaginationResult<AppointmentDTO>>;
  cancelAppointment(appointmentId: string): Promise<void>;
  approveDoctor(doctorId: string): Promise<string>;
  rejectDoctor(doctorId: string, reason?: string): Promise<string>;
  getAdminWalletPaginated(
    page: number,
    limit: number
  ): Promise<{ history: any[]; total: number; balance: number }>;
  getLatestDoctorRequests(limit: number): Promise<DoctorDTO[]>;
  getAppointmentsStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; count: number }[]>;
  getTopDoctors(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]>;
  getRevenueStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; revenue: number }[]>;
  getAllComplaints(
    page: number,
    limit: number
  ): Promise<{ complaints: ComplaintDTO[]; totalPages: number; currentPage: number }>;
  updateComplainStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  ): Promise<ComplaintDTO | null>;
}
