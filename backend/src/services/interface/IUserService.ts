import { AppointmentTypes } from "../../types/appointment";
import { DoctorData } from "../../types/doctor";
import { SlotRange } from "../../types/slots";
import { userData } from "../../types/user";

export interface UserDocument extends userData {
  _id: string;
}

export interface IUserService {
  register(
    name: string,
    email: string,
    password: string
  ): Promise<{ token: string }>;
  login(
    email: string,
    password: string
  ): Promise<{ user: UserDocument, token: string; refreshToken: string }>;
  getProfile(userId: string): Promise<userData | null>;
  updateProfile(
    userId: string,
    data: Partial<userData>,
    imageFile?: Express.Multer.File
  ): Promise<void>;
  checkEmailExists(email: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  finalizeRegister(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDocument>;
  resetPassword(email: string, newHashedPassword: string): Promise<boolean>;
  getUserById(id: string): Promise<UserDocument>;
  getDoctorById(id: string): Promise<DoctorData>;
  bookAppointment(appointmentData: AppointmentTypes): Promise<any>;
  listUserAppointments(userId: string): Promise<AppointmentTypes[]>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  startPayment(userId: string, appointmentId: string): Promise<{ order: any }>;
  verifyPayment(
    userId: string,
    appointmentId: string,
    razorpay_order_id: string
  ): Promise<void>;
  getAvailableSlotsByDate(
    doctorId: string,
    date: string
  ): Promise<SlotRange[]>
  getAvailableSlotsForDoctor(doctorId: string, year: number, month: number): Promise<any[]>;
}
