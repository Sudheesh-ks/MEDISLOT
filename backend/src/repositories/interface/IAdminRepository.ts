import { AdminDocument } from "../../models/adminModel";
import { AppointmentDocument } from "../../models/appointmentModel";
import { DoctorDocument } from "../../models/doctorModel";
import { userDocument } from "../../models/userModel";
import { PaginationResult } from "../../types/pagination";

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  findAdminById(id: string): Promise<AdminDocument | null>;
  getAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<DoctorDocument>>;
  getAllUsers(): Promise<userDocument[]>;
  getUsersPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<userDocument>>;
  toggleUserBlock(userId: string): Promise<userDocument>;
  getAllAppointments(): Promise<AppointmentDocument[]>;
  getAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>>;
  cancelAppointment(appointmentId: string): Promise<void>;
}
