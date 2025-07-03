import { adminData, AdminDocument } from "../../types/admin";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  findAdminById(id: string): Promise<AdminDocument | null>;
  // saveDoctor(data: DoctorData): Promise<void>;
  getAllDoctors(): Promise<Omit<DoctorData, "password">[]>;
  getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<Omit<DoctorData, "password">>>;
  getAllUsers(): Promise<Omit<userData, "password">[]>;
  getUsersPaginated(page: number, limit: number): Promise<PaginationResult<Omit<userData, "password">>>;
  toggleUserBlock(userId: string): Promise<string>;
  getAllAppointments():Promise<AppointmentDocument[]>;
  getAppointmentsPaginated(page: number, limit: number): Promise<PaginationResult<AppointmentTypes>>;
  cancelAppointment(appointmentId: string): Promise<void>;
}
