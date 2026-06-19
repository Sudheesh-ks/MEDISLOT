import { AdminDocument } from '../../models/AdminModel';
import { DoctorDocument } from '../../models/DoctorModel';
import { userDocument } from '../../models/UserModel';
import { PaginationResult } from '../../types/Pagination';

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  findAdminById(id: string): Promise<AdminDocument | null>;
  getAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginationResult<DoctorDocument>>;
  getAllUsers(): Promise<userDocument[]>;
  getUsersPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginationResult<userDocument>>;
  toggleUserBlock(userId: string): Promise<userDocument>;
  getLatestDoctorRequests(limit: number): Promise<DoctorDocument[]>;
  getTopDoctors(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]>;
  getRevenueStats(start?: string, end?: string): Promise<{ date: string; revenue: number }[]>;
}
