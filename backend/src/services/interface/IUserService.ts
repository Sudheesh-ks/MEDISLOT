import { AppointmentDTO } from '../../dtos/appointment.dto';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { FeedbackDTO } from '../../dtos/feedback.dto';
import { PrescriptionDTO } from '../../dtos/prescription.dto';
import { UserDTO } from '../../dtos/user.dto';
import { WalletDTO } from '../../dtos/wallet.dto';
import { ComplaintTypes } from '../../types/complaint';
import { PaginationResult } from '../../types/pagination';
import { RazorpayOrderDTO } from '../../types/payment';
import { SlotRange } from '../../types/slots';
import { userTypes } from '../../types/user';

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
  refreshToken(refreshToken?: string): Promise<{ token: string; refreshToken: string }>;
  getProfile(userId: string): Promise<UserDTO>;
  updateProfile(
    userId: string,
    data: Partial<userTypes>,
    imageFile?: Express.Multer.File
  ): Promise<void>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  getUserWalletPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    page: number,
    limit: number
  ): Promise<WalletDTO & { total: number }>;
  checkEmailExists(email: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  finalizeRegister(userTypes: { name: string; email: string; password: string }): Promise<UserDTO>;
  getUserById(id: string): Promise<UserDTO | null>;
  getDoctorById(id: string): Promise<DoctorDTO>;
  //   bookAppointment({
  //   userId,
  //   docId,
  //   slotDate,
  //   slotStartTime,
  //   slotEndTime,
  // }: {
  //   userId: string;
  //   docId: string;
  //   slotDate: string;
  //   slotStartTime: string;
  //   slotEndTime: string;
  // }): Promise<AppointmentDTO>;
  initiateBooking({
    userId,
    docId,
    slotDate,
    slotStartTime,
    slotEndTime,
  }: {
    userId: string;
    docId: string;
    slotDate: string;
    slotStartTime: string;
    slotEndTime: string;
  }): Promise<{ lockExpiresAt: Date; order: RazorpayOrderDTO; tempBookingId: string }>;
  listUserAppointmentsPaginated(
    userId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginationResult<AppointmentDTO>>;
  getActiveAppointment(userId: string): Promise<AppointmentDTO | null>;
  cancelAppointment(userId: string, appointmentId: string): Promise<void>;
  startPayment(userId: string, appointmentId: string): Promise<{ order: any }>;
  // verifyPayment(userId: string, appointmentId: string, razorpay_order_id: string): Promise<void>;
  verifyPayment(
    userId: string,
    // docId: string,
    // slotDate: string,
    // slotStartTime: string,
    // slotEndTime: string,
    appointmentId: string,
    razorpay_order_id: string
  ): Promise<AppointmentDTO>;
  cancelTempBooking(tempBookingId: string): Promise<any>;
  cleanupExpiredLocks(): Promise<void>;
  getAvailableSlotsByDate(doctorId: string, date: string, userId: string): Promise<SlotRange[]>;
  getAvailableSlotsForDoctor(doctorId: string, year: number, month: number): Promise<any[]>;
  submitFeedback(userId: string, apptId: string, message: string, rating: number): Promise<any>;
  getPrescriptionByAppointmentId(appointmentId: string): Promise<PrescriptionDTO | null>;
  getAllReviews(doctorId: string): Promise<FeedbackDTO[]>;
  reportIssue(userId: string, subject: string, description: string): Promise<ComplaintTypes>;
}
