import { AdminDocument } from "../../models/adminModel";
import { AppointmentDocument } from "../../models/appointmentModel";
import { DoctorDocument } from "../../models/doctorModel";
import { userDocument } from "../../models/userModel";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorTypes } from "../../types/doctor";
import { PaginationResult } from "../../types/pagination";
import { userTypes } from "../../types/user";


export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  findAdminById(id: string): Promise<AdminDocument | null>;
  // saveDoctor(data: DoctorTypes): Promise<void>;
  getAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<DoctorDocument>>;
  getAllUsers(): Promise<userDocument[]>;
  getUsersPaginated(page: number, limit: number): Promise<PaginationResult<userDocument>>;
  toggleUserBlock(userId: string): Promise<string>;
  getAllAppointments():Promise<AppointmentDocument[]>;
  getAppointmentsPaginated(page: number, limit: number): Promise<PaginationResult<AppointmentDocument>>;
  cancelAppointment(appointmentId: string): Promise<void>;
}
