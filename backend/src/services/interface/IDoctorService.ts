import { AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";

export interface IDoctorService {
  registerDoctor(data: DoctorData): Promise<void>;
  toggleAvailability(docId: string): Promise<void>;
  getAllDoctors(): Promise<any[]>;
  loginDoctor(email: string, plainPassword: string): Promise<string | null>;
  getDoctorAppointments(docId: string): Promise<AppointmentTypes[]>;
  confirmAppointment(docId: string, appointmentId: string): Promise<void>;
  cancelAppointment(docId: string, appointmentId: string): Promise<void>;
  getDoctorProfile(docId: string): Promise<DoctorData | null>;
  updateDoctorProfile(data: {
    doctId: string;
    name: string;
    speciality: string;
    degree: string;
    experience: string;
    about: string;
    fees: number;
    address: DoctorData["address"];
    imagePath?: string;
  }): Promise<void>;
}
