import { AppointmentDocument } from "../../types/appointment";
import { DoctorData, DoctorDTO } from "../../types/doctor";

export interface DoctorInput extends DoctorData {
  imageFile?: Express.Multer.File;
}

export interface IAdminService {
  login(email: string, password: string): Promise<{ token: string }>;
  addDoctor(data: DoctorDTO): Promise<string>;
  getDoctors(): Promise<any[]>;
  getUsers(): Promise<any[]>;
  toggleUserBlock(userId: string, block: boolean): Promise<string>;
  listAppointments(): Promise<AppointmentDocument[]>;
  cancelAppointment(appointmentId: string): Promise<void>;
  approveDoctor(doctorId: string): Promise<string>;
rejectDoctor(doctorId: string): Promise<string>;
}
