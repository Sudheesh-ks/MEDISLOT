import { DoctorTypes } from '../../types/doctor';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { PaginationResult } from '../../types/pagination';

export interface IDoctorService {
  registerDoctor(data: DoctorTypes): Promise<void>;
  getPublicDoctorById(id: string): Promise<DoctorDTO>;
  toggleAvailability(docId: string): Promise<void>;
  getAllDoctors(): Promise<DoctorDTO[]>;
  getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<DoctorDTO>>;
  loginDoctor(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; refreshToken: string }>;
  getDoctorAppointments(docId: string): Promise<AppointmentDTO[]>;
  getDoctorAppointmentsPaginated(
    docId: string,
    pageQuery: string,
    limitQuery: string,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDTO>>;
  confirmAppointment(docId: string, appointmentId: string): Promise<void>;
  cancelAppointment(docId: string, appointmentId: string): Promise<void>;
  getActiveAppointment(docId: string): Promise<AppointmentDTO | null>;
  getDoctorProfile(docId: string): Promise<DoctorDTO>;
  updateDoctorProfile(data: {
    doctId: string;
    name: string;
    speciality: string;
    degree: string;
    experience: string;
    about: string;
    fees: number;
    address: DoctorTypes['address'];
    imagePath?: string;
    available?: boolean;
  }): Promise<void>;
  getDoctorWalletPaginated(
    doctorId: string,
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all'
  ): Promise<{ history: any[]; total: number; balance: number }>;
}
