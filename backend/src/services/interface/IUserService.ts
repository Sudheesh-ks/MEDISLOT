import { DoctorDTO } from '../../dtos/Doctor.dto';
import { FeedbackDTO } from '../../dtos/Feedback.dto';
import { PrescriptionDTO } from '../../dtos/Prescription.dto';
import { UserDTO } from '../../dtos/User.dto';
import { WalletDTO } from '../../dtos/Wallet.dto';
import { ComplaintTypes } from '../../types/Complaint';
import { SlotRange } from '../../types/Slots';
import { userTypes } from '../../types/User';

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
  getAvailableSlotsByDate(doctorId: string, date: string, userId: string): Promise<SlotRange[]>;
  getAvailableSlotsForDoctor(doctorId: string, year: number, month: number): Promise<any[]>;
  submitFeedback(userId: string, apptId: string, message: string, rating: number): Promise<any>;
  getPrescriptionByAppointmentId(appointmentId: string): Promise<PrescriptionDTO | null>;
  getAllReviews(doctorId: string): Promise<FeedbackDTO[]>;
  reportIssue(userId: string, subject: string, description: string): Promise<ComplaintTypes>;
}
