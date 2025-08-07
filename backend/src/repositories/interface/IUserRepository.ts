import { userTypes } from "../../types/user";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorTypes } from "../../types/doctor";
import { userDocument } from "../../models/userModel";
import { AppointmentDocument } from "../../models/appointmentModel";
import { DoctorDocument } from "../../models/doctorModel";
import { PaginationResult } from "../../types/pagination";

export interface UserDocument extends userTypes {
  _id: string;
}

export interface IUserRepository {
  createUser(user: Partial<userDocument>): Promise<userDocument>;
  findUserByEmail(email: string): Promise<userDocument | null>;
  findUserById(id: string): Promise<userDocument | null>;
  updateUserById(id: string, data: Partial<userTypes>): Promise<void>;
  updatePasswordByEmail(
    email: string,
    newHashedPassword: string
  ): Promise<boolean>;
  bookAppointment(
    appointmentData: AppointmentTypes
  ): Promise<AppointmentDocument>;
  findDoctorById(id: string): Promise<DoctorDocument | null>;
  findAppointmentById(
    appointmentId: string
  ): Promise<AppointmentDocument | null>;
  getAppointmentsByUserIdPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>>;
  findActiveAppointment(userId: string): Promise<AppointmentDocument | null>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  findPayableAppointment(
    userId: string,
    appointmentId: string
  ): Promise<AppointmentDocument>;
  saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void>;
  markAppointmentPaid(appointmentId: string): Promise<void>;
  getAvailableSlotsByDoctorAndMonth(
    doctorId: string,
    year: number,
    month: number
  ): Promise<any[]>;
}
