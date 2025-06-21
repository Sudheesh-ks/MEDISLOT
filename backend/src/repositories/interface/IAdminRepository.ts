import { adminData, AdminDocument } from "../../types/admin";
import { AppointmentDocument } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  saveDoctor(data: DoctorData): Promise<void>;
  getAllDoctors(): Promise<Omit<DoctorData, "password">[]>;
  getAllUsers(): Promise<Omit<userData, "password">[]>;
  toggleUserBlock(userId: string): Promise<string>;
  getAllAppointments():Promise<AppointmentDocument[]>;
  cancelAppointment(appointmentId: string): Promise<void>;
}
