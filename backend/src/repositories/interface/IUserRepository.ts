import { userData } from "../../types/user";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";

export interface UserDocument extends userData {
  _id: string;
}

export interface IUserRepository {
  create(user: Partial<userData>): Promise<UserDocument>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findById(id: string): Promise<UserDocument | null>;
  updateById(id: string, data: Partial<userData>): Promise<void>;
  updatePasswordByEmail(
    email: string,
    newHashedPassword: string
  ): Promise<boolean>;
  bookAppointment(appointmentData: AppointmentTypes): Promise<void>;
  findDoctorById(id: string): Promise<DoctorData | null>;
  getAppointmentsByUserId(userId: string): Promise<AppointmentTypes[]>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  findPayableAppointment(userId: string,appointmentId: string): Promise<AppointmentDocument>;
  saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void>;
  markAppointmentPaid(appointmentId: string): Promise<void>;
  getAvailableSlotsByDoctorAndMonth(doctorId: string, year: number, month: number): Promise<any[]>;

}
