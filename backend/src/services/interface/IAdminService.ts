import { adminData, AdminDocument } from "../../types/admin";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import { DoctorData, DoctorDTO } from "../../types/doctor";
import { PaginationResult } from "../../repositories/interface/IAdminRepository";

export interface DoctorInput extends DoctorData {
  imageFile?: Express.Multer.File;
}

export interface IAdminService {
  login(email: string, password: string): Promise<{ admin: AdminDocument, accessToken: string, refreshToken: string }>;
  getAdminById(id: string): Promise<AdminDocument | null>;
  validateCredentials(email: string, password: string): Promise<adminData>;
  addDoctor(data: DoctorDTO): Promise<string>;
  getDoctors(): Promise<any[]>;
  getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<any>>;
  getUsers(): Promise<any[]>;
  getUsersPaginated(page: number, limit: number): Promise<PaginationResult<any>>;
  toggleUserBlock(userId: string, block: boolean): Promise<string>;
  listAppointments(): Promise<AppointmentDocument[]>;
  listAppointmentsPaginated(page: number, limit: number): Promise<PaginationResult<AppointmentTypes>>;
  cancelAppointment(appointmentId: string): Promise<void>;
  approveDoctor(doctorId: string): Promise<string>;
  rejectDoctor(doctorId: string): Promise<string>;
}
