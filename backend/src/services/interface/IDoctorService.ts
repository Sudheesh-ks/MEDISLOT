import { AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";

export interface IDoctorService {
  registerDoctor(data: DoctorData): Promise<void>
  toggleAvailability(docId: string): Promise<void>;
  getAllDoctors(): Promise<any[]>;
  loginDoctor(email: string, plainPassword: string): Promise<string | null>;
  getDoctorAppointments(docId: string): Promise<AppointmentTypes[]>;
  confirmAppointment(docId: string, appointmentId: string): Promise<void>;
  cancelAppointment(docId: string, appointmentId: string): Promise<void>; 
}
