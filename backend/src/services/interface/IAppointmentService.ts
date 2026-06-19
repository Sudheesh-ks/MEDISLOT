import { AppointmentDTO } from '../../dtos/Appointment.dto';
import { PaginationResult } from '../../types/Pagination';
import { RazorpayOrderDTO } from '../../types/Payment';

export interface IAppointmentService {
  initiateBooking({
    userId,
    docId,
    slotDate,
    slotStartTime,
    slotEndTime,
    patientDetails,
  }: {
    userId: string;
    docId: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
    patientDetails: {
      name: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      height?: string;
      weight?: string;
      problemDescription: string;
      vitals?: {
        temperature?: string;
        bloodPressure?: string;
        heartRate?: string;
      };
    };
  }): Promise<{ lockExpiresAt: Date; order: RazorpayOrderDTO; tempBookingId: string }>;
  getUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filterType?: 'all' | 'upcoming' | 'ended'
  ): Promise<PaginationResult<AppointmentDTO>>;
  getActiveUserAppointment(userId: string): Promise<AppointmentDTO | null>;
  cancelAppointmentByUser(userId: string, appointmentId: string): Promise<void>;
  startPayment(userId: string, appointmentId: string): Promise<{ order: RazorpayOrderDTO }>;
  verifyPayment(
    userId: string,
    tempBookingId: string,
    razorpay_order_id: string
  ): Promise<AppointmentDTO>;
  cancelTempBooking(tempBookingId: string): Promise<any>;
  cleanupExpiredLocks(): Promise<void>;
  getAppointmentsByDoctorId(docId: string): Promise<AppointmentDTO[]>;
  getDoctorAppointments(
    docId: string,
    pageQuery: string,
    limitQuery: string,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDTO>>;
  confirmAppointment(docId: string, appointmentId: string): Promise<void>;
  cancelAppointmentByDoctor(docId: string, appointmentId: string): Promise<void>;
  getActiveDoctorAppointments(docId: string): Promise<AppointmentDTO | null>;
  getAppointmentById(appointmentId: string): Promise<AppointmentDTO>;
  getAllAppointments(): Promise<AppointmentDTO[]>;
  getAppointments(
    page: number,
    limit: number,
    search: string,
    dateRange: string
  ): Promise<PaginationResult<AppointmentDTO>>;
  cancelAppointmentByAdmin(appointmentId: string): Promise<void>;
  getAppointmentsStats(
    startDate?: string,
    endDate?: string
  ): Promise<{ date: string; count: number }[]>;
  //   getUserAppointments(
  //   userId: string,
  //   page: number,
  //   limit: number,
  //   filterType?: 'all' | 'upcoming' | 'ended'
  // ): Promise<PaginationResult<AppointmentDTO>>;
  //   getActiveUserAppointment(userId: string): Promise<AppointmentDTO | null>;
  //   cancelAppointmentByUser(userId: string, appointmentId: string): Promise<void>;
  //   startPayment(userId: string, appointmentId: string): Promise<{ order: RazorpayOrderDTO }>;
  //   verifyPayment(userId: string, tempBookingId: string, razorpay_order_id: string): Promise<AppointmentDTO>;
  //   cancelTempBooking(tempBookingId: string): Promise<any>;
  //   cleanupExpiredLocks(): Promise<void>

  //   // Doctor appointment methods (moved from DoctorService)
  //   getDoctorAppointments(docId: string): Promise<AppointmentDTO[]>;
  //   getDoctorAppointmentsPaginated(
  //       docId: string,
  //       pageQuery: string,
  //       limitQuery: string,
  //       search?: string,
  //       dateRange?: string
  //   ): Promise<PaginationResult<AppointmentDTO>>;
  //   confirmAppointment(docId: string, appointmentId: string): Promise<void>;
  //   cancelAppointmentByDoctor(docId: string, appointmentId: string): Promise<void>;
  //   getActiveDoctorAppointment(docId: string): Promise<AppointmentDTO | null>;
  //   getAppointmentById(appointmentId: string): Promise<AppointmentDTO>;

  //   // Admin appointment methods (moved from AdminService)
  //   listAppointments(): Promise<AppointmentDTO[]>;
  //   listAppointmentsPaginated(
  //       page: number,
  //       limit: number,
  //       search: string,
  //       dateRange: string
  //   ): Promise<PaginationResult<AppointmentDTO>>;
  //   cancelAppointmentByAdmin(appointmentId: string): Promise<void>;
  //   getAppointmentsStats(startDate?: string, endDate?: string): Promise<{ date: string; count: number }[]>;
}

// initiateBooking
// getAppointmetspaginated
// getAppointmentsbyid
// getActiveAppointments
// confirmappointment
// cancelAppointments
// startp
// verifyp
// canceltemp
// cleanup
// getappointmentsstats
