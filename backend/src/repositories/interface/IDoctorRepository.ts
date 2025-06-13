import { AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";

export interface IDoctorRepository {
  findById(id: string): Promise<DoctorData | null>;
  updateAvailability(id: string, available: boolean): Promise<void>;
  findAllDoctors(): Promise<Partial<DoctorData>[]>;
  findByEmail(email: string): Promise<DoctorData | null>;
  findAppointmentsByDoctorId(docId: string): Promise<AppointmentTypes[]>;
  findAppointmentById(id: string): Promise<AppointmentTypes | null>;
  markAppointmentAsConfirmed(id: string): Promise<void>;
  cancelAppointment(id: string): Promise<void>
}
