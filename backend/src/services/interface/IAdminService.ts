import { UserDTO } from '../../dtos/User.dto';
import { DoctorTypes } from '../../types/Doctor';
import { DoctorDTO } from '../../dtos/Doctor.dto';
import { AdminDTO } from '../../dtos/Admin.dto';
import { PaginationResult } from '../../types/Pagination';
import { ComplaintDTO } from '../../dtos/Complaint.dto';

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
  getDoctorById(id: string): Promise<DoctorDTO | null>;
  getDoctorsPaginated(
    page: string,
    limit: string,
    search?: string
  ): Promise<PaginationResult<DoctorDTO>>;
  getUsers(): Promise<UserDTO[]>;
  getUsersPaginated(
    page: string,
    limit: string,
    search?: string
  ): Promise<PaginationResult<UserDTO>>;
  toggleUserBlock(userId: string, block: boolean): Promise<UserDTO>;
  toggleUserBlock(userId: string, block: boolean): Promise<UserDTO>;
  approveDoctor(doctorId: string): Promise<string>;
  rejectDoctor(doctorId: string, reason?: string): Promise<string>;
  blockDoctor(doctorId: string, reason?: string): Promise<string>;
  unBlockDoctor(doctorId: string): Promise<string>;
  getAdminWalletPaginated(
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all',
    startDate?: string,
    endDate?: string
  ): Promise<{
    history: any[];
    total: number;
    balance: number;
    filteredCredits: number;
    filteredDebits: number;
  }>;
  getLatestDoctorRequests(limit: number): Promise<DoctorDTO[]>;
  getTopDoctors(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]>;
  getRevenueStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; revenue: number }[]>;
  getAllComplaints(
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{ complaints: ComplaintDTO[]; totalPages: number; currentPage: number }>;
  updateComplainStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  ): Promise<ComplaintDTO | null>;
}
