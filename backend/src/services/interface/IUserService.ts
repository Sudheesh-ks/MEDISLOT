import { AppointmentDTO } from "../../dtos/appointment.dto";
import { DoctorDTO } from "../../dtos/doctor.dto";
import { UserDTO } from "../../dtos/user.dto";
import { WalletDTO } from "../../dtos/wallet.dto";
import { PaginationResult } from "../../types/pagination";
import { SlotRange } from "../../types/slots";
import { userTypes } from "../../types/user";

export interface UserDocument extends userTypes {
  _id: string;
}

export interface IUserService {
  register(name: string, email: string, password: string): Promise<void>;
  verifyOtp(
    email: string,
    otp: string
  ): Promise<{
    purpose: string;
    user?: UserDTO;
    refreshToken?: string;
  }>;
  resendOtp(email: string): Promise<void>;
  forgotPasswordRequest(email: string): Promise<void>;
  resetPassword(email: string, newPassword: string): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{ user: UserDTO; token: string; refreshToken: string }>;
  refreshToken(
    refreshToken?: string
  ): Promise<{ token: string; refreshToken: string }>;
  getProfile(userId: string): Promise<UserDTO | null>;
  updateProfile(
    userId: string,
    data: Partial<userTypes>,
    imageFile?: Express.Multer.File
  ): Promise<void>;
  getUserWallet(userId: string): Promise<WalletDTO>
  checkEmailExists(email: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  finalizeRegister(userTypes: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDTO>;
  getUserById(id: string): Promise<UserDTO | null>;
  getDoctorById(id: string): Promise<DoctorDTO>;
  bookAppointment({
    userId,
    docId,
    slotDate,
    slotStartTime,
    slotEndTime
  }: {
    userId: string;
    docId: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
  }): Promise<AppointmentDTO>;
  listUserAppointmentsPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>>;
  getActiveAppointment(
      userId: string
    ): Promise<AppointmentDTO | null>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  startPayment(userId: string, appointmentId: string): Promise<{ order: any }>;
  verifyPayment(
    userId: string,
    appointmentId: string,
    razorpay_order_id: string
  ): Promise<void>;
  getAvailableSlotsByDate(doctorId: string, date: string): Promise<SlotRange[]>;
  getAvailableSlotsForDoctor(
    doctorId: string,
    year: number,
    month: number
  ): Promise<any[]>;
}
