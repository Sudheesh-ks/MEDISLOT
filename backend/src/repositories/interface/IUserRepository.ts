import { userTypes } from '../../types/User';
import { AppointmentTypes } from '../../types/Appointment';
import { userDocument } from '../../models/UserModel';
import { AppointmentDocument } from '../../models/AppointmentModel';
import { DoctorDocument } from '../../models/DoctorModel';
import { PaginationResult } from '../../types/Pagination';

export interface IUserRepository {
  createUser(user: Partial<userDocument>): Promise<userDocument>;
  findUserByEmail(email: string): Promise<userDocument | null>;
  findUserById(id: string): Promise<userDocument | null>;
  updateUserById(id: string, data: Partial<userTypes>): Promise<void>;
  updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean>;
  bookAppointment(appointmentData: AppointmentTypes): Promise<AppointmentDocument>;
  findDoctorById(id: string): Promise<DoctorDocument | null>;
  findAppointmentById(appointmentId: string): Promise<AppointmentDocument | null>;
  getAppointmentsByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
    filterType?: 'all' | 'upcoming' | 'ended'
  ): Promise<PaginationResult<AppointmentDocument>>;
  findActiveAppointment(userId: string): Promise<AppointmentDocument | null>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  findPayableAppointment(userId: string, appointmentId: string): Promise<AppointmentDocument>;
  saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void>;
  markAppointmentPaid(appointmentId: string): Promise<void>;
  getAvailableSlotsByDoctorAndMonth(doctorId: string, year: number, month: number): Promise<any[]>;
}
