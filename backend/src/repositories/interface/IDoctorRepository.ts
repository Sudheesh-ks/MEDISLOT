import { AppointmentDocument } from '../../models/appointmentModel';
import { DoctorDocument } from '../../models/doctorModel';
import { DoctorTypes } from '../../types/doctor';
import { PaginationResult } from '../../types/pagination';

export interface IDoctorRepository {
  registerDoctor(data: DoctorTypes): Promise<DoctorDocument>;
  findById(id: string): Promise<DoctorDocument | null>;
  updateAvailability(id: string, available: boolean): Promise<void>;
  findAllDoctors(): Promise<DoctorDocument[]>;
  getDoctorsPaginated(page: number, limit: number): Promise<PaginationResult<DoctorDocument>>;
  findByEmail(email: string): Promise<DoctorDocument | null>;
  save(doctor: DoctorDocument): Promise<void>;
  findAppointmentsByDoctorId(docId: string): Promise<AppointmentDocument[]>;
  getAppointmentsPaginated(
    docId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>>;
  findAppointmentById(id: string): Promise<AppointmentDocument | null>;
  markAppointmentAsConfirmed(id: string): Promise<void>;
  cancelAppointment(id: string): Promise<void>;
  findActiveAppointment(docId: string): Promise<AppointmentDocument | null>;
  getDoctorProfileById(id: string): Promise<DoctorDocument | null>;
  updateDoctorProfile(
    id: string,
    updateData: Partial<
      Pick<
        DoctorTypes,
        | 'name'
        | 'speciality'
        | 'degree'
        | 'experience'
        | 'about'
        | 'fees'
        | 'address'
        | 'image'
        | 'available'
      >
    >
  ): Promise<void>;
  getRevenueOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]>;
  getAppointmentsOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]>;
}
