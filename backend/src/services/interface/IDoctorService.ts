import { DoctorTypes } from '../../types/doctor';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { PaginationResult } from '../../types/pagination';
import { patientHistoryTypes } from '../../types/patientHistoryTypes';

export interface IDoctorService {
  registerDoctor(data: DoctorTypes): Promise<void>;
  getPublicDoctorById(id: string): Promise<DoctorDTO>;
  toggleAvailability(docId: string): Promise<void>;
  getAllDoctors(): Promise<DoctorDTO[]>;
  getDoctorsPaginated(query: any): Promise<PaginationResult<DoctorDTO>>;
  loginDoctor(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; refreshToken: string }>;
  refreshToken(refreshToken?: string): Promise<{ token: string; refreshToken: string }>;
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
  updateDoctorProfile(body: any, imageFile?: Express.Multer.File): Promise<void>;
  getDoctorWalletPaginated(
    doctorId: string,
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all'
  ): Promise<{ history: any[]; total: number; balance: number }>;
  getDashboardData(doctorId: string, startDate: string, endDate: string): Promise<any>;
  createPatientHistory(data: patientHistoryTypes): Promise<void>;
  updatePatientHistory(
    historyId: string,
    data: Partial<patientHistoryTypes>
  ): Promise<patientHistoryTypes | null>;
  getPatientHistory(doctorId: string, userId: string): Promise<any>;
  getPatientHistoryById(historyId: string): Promise<any>;
  getPatientById(patientId: string): Promise<any>;
}
