import { AppointmentDocument } from '../../models/AppointmentModel';
import { AppointmentTypes } from '../../types/Appointment';
import { PaginationResult } from '../../types/Pagination';

export interface IAppointmentRepository {
  createAppointment(appointmentData: AppointmentTypes): Promise<AppointmentDocument>;
  getAppointments(
    page: number,
    limit: number,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDocument>>;
  findAppointmentById(appointmentId: string): Promise<AppointmentDocument | null>;
  findUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filterType?: 'all' | 'upcoming' | 'ended'
  ): Promise<PaginationResult<AppointmentDocument>>;
  findActiveUserAppointment(userId: string): Promise<AppointmentDocument | null>;
  findPayableAppointment(appointmentId: string): Promise<AppointmentDocument>;
  saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void>;
  markAppointmentPaid(appointmentId: string): Promise<void>;
  confirmAppointment(id: string): Promise<void>;
  findDoctorAppointments(
    docId: string,
    page: number,
    limit: number,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDocument>>;
  findAppointmentsByDoctorId(docId: string): Promise<AppointmentDocument[]>;
  findActiveDoctorAppointment(docId: string): Promise<AppointmentDocument | null>;
  findAppointmentsOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]>;
  getAllAppointments(): Promise<AppointmentDocument[]>;
  cancelAppointment(appointmentId: string): Promise<void>;
  getAppointmentsOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]>;
  getAppointmentsStats(start?: string, end?: string): Promise<{ date: string; count: number }[]>;
  findStaleAppointments(): Promise<AppointmentDocument[]>;
  getDoctorRevenueFromAppointments(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]>;
  getTopDoctorsByAppointments(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]>;
  getAdminRevenueFromAppointments(
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]>;
}
