import { AdminDocument } from '../../models/adminModel';
import { AppointmentDocument } from '../../models/appointmentModel';
import { DoctorDocument } from '../../models/doctorModel';
import { userDocument } from '../../models/userModel';
import { PaginationResult } from '../../types/pagination';

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
  getAllAppointments(): Promise<AppointmentDocument[]>;
  getAppointmentById(id: string): Promise<AppointmentDocument | null>;
  getAppointmentsPaginated(
    page: number,
    limit: number,
    search: string,
    dateRange: string
  ): Promise<PaginationResult<AppointmentDocument>>;
  cancelAppointment(appointmentId: string): Promise<void>;
  getLatestDoctorRequests(limit: number): Promise<DoctorDocument[]>;
  getAppointmentsStats(start?: string, end?: string): Promise<{ date: string; count: number }[]>;
  getTopDoctors(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]>;
  getRevenueStats(start?: string, end?: string): Promise<{ date: string; revenue: number }[]>;
}
