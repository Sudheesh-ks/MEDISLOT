import { IUserService } from '../interface/IUserService';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { userTypes } from '../../types/User';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import {
  isValidAddress,
  isValidDateOfBirth,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
} from '../../utils/Validator';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/Jwt.utils';
import { SlotRange } from '../../types/Slots';
import { isoDate } from '../../utils/Date.util';
import { UserDTO } from '../../dtos/User.dto';
import { toUserDTO } from '../../mappers/User.mapper';
import { userDocument } from '../../models/UserModel';
import { HttpResponse } from '../../constants/ResponseMessage.constants';
import { generateOTP } from '../../utils/Otp.util';
// import { this._OtpRedisService } from '../../utils/this._OtpRedisService';
import { sendOTP } from '../../utils/Mail.util';
import { WalletDTO } from '../../dtos/Wallet.dto';
import { PrescriptionDTO } from '../../dtos/Prescription.dto';
import { toPrescriptionDTO } from '../../mappers/Prescription.mapper';
import { FeedbackDTO } from '../../dtos/Feedback.dto';
import { toFeedbackDTO } from '../../mappers/Feedback.mapper';
import { ComplaintTypes } from '../../types/Complaint';
import { IPaymentService } from '../interface/IPaymentService';
import { ISlotRepository } from '../../repositories/interface/ISlotRepository';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { IFeedbackRepository } from '../../repositories/interface/IFeedbackRepository';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { IPatientHistoryRepository } from '../../repositories/interface/IPatientHistoryRepository';
import { DoctorDTO } from '../../dtos/Doctor.dto';
import { slotDTO } from '../../dtos/Slot.dto';
import { ISlotService } from '../interface/ISlotService';
import { ITempAppointmentRepository } from '../../repositories/interface/ITempAppointmentRepository';
import { toDoctorDTO } from '../../mappers/Doctor.mapper';
import { IOtpRedisService } from '../interface/IOtpRedisService';
import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import { IAppointmentRepository } from '../../repositories/interface/IAppointmentRepository';

export interface UserDocument extends userTypes {
  _id: string;
}

export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _OtpRedisService: IOtpRedisService,
    private readonly _paymentService: IPaymentService,
    private readonly _slotService: ISlotService,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _feedbackRepository: IFeedbackRepository,
    private readonly _complaintRepository: IComplaintRepository,
    private readonly _patientHistoryRepository: IPatientHistoryRepository,
    private readonly _tempAppointmentRepository: ITempAppointmentRepository,
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _appointmentRepository: IAppointmentRepository
  ) {}

  async register(name: string, email: string, password: string): Promise<void> {
    if (!name || !email || !password) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }

    if (!isValidName(name)) {
      throw new Error(HttpResponse.INVALID_NAME);
    }

    if (!isValidEmail(email)) {
      throw new Error(HttpResponse.INVALID_EMAIL);
    }

    if (!isValidPassword(password)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const existing = await this._userRepository.findUserByEmail(email);
    if (existing) {
      throw new Error(HttpResponse.EMAIL_ALREADY_EXISTS);
    }

    const hashed = await this.hashPassword(password);
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    await this._OtpRedisService.storeOtp(email, {
      otp,
      purpose: 'register',
      userData: { name, email, password: hashed },
    });

    try {
      await sendOTP(email, otp);
    } catch (error) {
      console.error('Email send failed:', error);
      throw new Error(HttpResponse.OTP_SEND_FAILED);
    }
  }

  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{
    purpose: string;
    user?: UserDTO;
    refreshToken?: string;
  }> {
    const record = await this._OtpRedisService.getOtp(email);

    if (!record || record.otp !== otp) {
      throw new Error(HttpResponse.OTP_INVALID);
    }

    const { purpose } = record;

    if (purpose === 'register') {
      const newUser = await this.finalizeRegister(record.userData);

      this._OtpRedisService.deleteOtp(email);

      const refreshToken = generateRefreshToken(newUser._id!);
      return { purpose, user: newUser, refreshToken };
    }

    if (purpose === 'reset-password') {
      await this._OtpRedisService.storeOtp(email, { ...record, otp: 'VERIFIED' });
      return { purpose };
    }

    throw new Error(HttpResponse.BAD_REQUEST);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  async finalizeRegister(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDTO> {
    const existing = await this._userRepository.findUserByEmail(userData.email);
    if (existing) throw new Error('User already exists');

    const newUser = (await this._userRepository.createUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })) as userDocument;

    return toUserDTO(newUser);
  }

  async resendOtp(email: string): Promise<void> {
    const oldRecord = await this._OtpRedisService.getOtp(email);

    if (!oldRecord) {
      throw new Error('No pending OTP found. Please register again.');
    }

    const newOtp = generateOTP();
    console.log('Generated new OTP:', newOtp);

    const updatedRecord = { ...oldRecord, otp: newOtp };

    await this._OtpRedisService.storeOtp(email, updatedRecord);
    await sendOTP(email, newOtp);
  }

  async forgotPasswordRequest(email: string): Promise<void> {
    const userExists = await this.checkEmailExists(email);
    if (!userExists) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    await this._OtpRedisService.storeOtp(email, { otp, purpose: 'reset-password', email });

    await sendOTP(email, otp);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const record = await this._OtpRedisService.getOtp(email);

    if (!record || record.purpose !== 'reset-password' || record.otp !== 'VERIFIED') {
      throw new Error(HttpResponse.OTP_EXPIRED_OR_INVALID);
    }

    const hashed = await this.hashPassword(newPassword);
    const updated = await this._userRepository.updatePasswordByEmail(email, hashed);

    if (!updated) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    this._OtpRedisService.deleteOtp(email);
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserDTO; token: string; refreshToken: string }> {
    if (!email || !password) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }

    if (!isValidEmail(email)) {
      throw new Error(HttpResponse.INVALID_EMAIL);
    }

    if (!isValidPassword(password)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const user = await this._userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error(HttpResponse.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error(HttpResponse.INCORRECT_PASSWORD);
    }

    if (user.isBlocked) {
      throw new Error('Your account has been blocked by admin');
    }

    const token = generateAccessToken(user._id.toString(), user.email, 'user');
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: toUserDTO(user),
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken?: string): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      throw new Error(HttpResponse.REFRESH_TOKEN_INVALID);
    }

    const user = await this._userRepository.findUserById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.email, 'user');
    const newRefreshToken = generateRefreshToken(user._id.toString());

    return { token: newAccessToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await this._userRepository.findUserById(userId);
    if (!user) throw new Error(HttpResponse.USER_NOT_FOUND);
    return toUserDTO(user);
  }

  async updateProfile(
    userId: string,
    data: Partial<userTypes>,
    imageFile?: Express.Multer.File
  ): Promise<void> {
    if (!data.name || !data.phone || !data.address || !data.dob || !data.gender)
      throw new Error('Please provide all details');

    if (!isValidName(data.name)) throw new Error('Invalid name format');
    if (!isValidPhone(data.phone)) throw new Error('Phone number must be 10 numbers');
    if (!isValidDateOfBirth(data.dob)) throw new Error('Enter a valid birth date');
    if (!isValidAddress(data.address.line1))
      throw new Error('Address should contain 4 - 50 characters');
    if (!isValidAddress(data.address.line2))
      throw new Error('Address should contain 4 - 50 characters');
    if (!['Male', 'Female'].includes(data.gender)) throw new Error('Invalid gender value');

    if (
      typeof data.address !== 'object' ||
      !data.address.line1?.trim() ||
      !data.address.line2?.trim()
    ) {
      throw new Error('Both address lines are required');
    }

    if (imageFile) {
      const MAX_SIZE = 1 * 1024 * 1024;
      if (imageFile.size > MAX_SIZE) {
        throw new Error('Image size must be less than 1MB');
      }

      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
        type: 'authenticated',
      });
      data.image = imageUpload.public_id;
    }

    await this._userRepository.updateUserById(userId, data);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const user = await this._userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedpassword = await bcrypt.hash(newPassword, 10);

    await this._userRepository.updateUserById(userId, { password: hashedpassword });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userRepository.findUserByEmail(email);
    return !!user;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this._userRepository.findUserById(id);
    if (!user) throw new Error('User not found');
    return user ? toUserDTO(user) : null;
  }

  async getDoctorById(id: string): Promise<DoctorDTO> {
    const doctor = await this._doctorRepository.findDoctorById(id);
    if (!doctor) throw new Error('Doctor not found');
    return toDoctorDTO(doctor);
  }

  async getUserWalletPaginated(
    ownerId: string,
    ownerType: 'user' | 'doctor' | 'admin',
    page: number,
    limit: number
  ): Promise<WalletDTO & { total: number }> {
    const wallet = await this._walletRepository.getOrCreateWallet(ownerId, ownerType);

    const total = wallet.history.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedHistory = wallet.history
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(startIndex, endIndex);

    return {
      ownerId: wallet.ownerId,
      ownerType: wallet.ownerType,
      balance: wallet.balance,
      history: paginatedHistory,
      total,
    };
  }

  async getAvailableSlotsByDate(
    doctorId: string,
    date: string,
    userId: string
  ): Promise<SlotRange[]> {
    if (!doctorId || !date) {
      throw new Error('doctorId and date are required');
    }

    const slots = await this._slotService.getDayAvailability(doctorId, isoDate(date), userId);
    return slots.filter((r) => r.isAvailable && !r.booked);
  }

  async getAvailableSlotsForDoctor(
    doctorId: string,
    year: number,
    month: number
  ): Promise<slotDTO[]> {
    if (!doctorId || !year || !month) {
      throw new Error('doctorId, year, and month are required');
    }

    return this._slotRepository.getAvailableSlotsByDoctorAndMonth(doctorId, year, month);
  }

  async submitFeedback(
    userId: string,
    apptId: string,
    message: string,
    rating: number
  ): Promise<FeedbackDTO> {
    if (!message) throw new Error('Feedback message is required');
    if (!apptId) throw new Error('Appointment ID is required');
    if (!rating || rating < 1 || rating > 5) throw new Error('Rating must be 1–5');

    const user = await this._userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    const appointment = await this._appointmentRepository.findAppointmentById(apptId);
    if (!appointment) throw new Error('Appointment not found');

    const feedbackDoc = await this._feedbackRepository.submitFeedback(
      userId,
      apptId,
      appointment.docId.toString(),
      {
        name: user.name,
        email: user.email,
      },
      message,
      rating
    );

    await this._doctorRepository.updateDoctorRating(appointment.docId.toString(), rating);

    return toFeedbackDTO(feedbackDoc);
  }

  async getPrescriptionByAppointmentId(appointmentId: string): Promise<PrescriptionDTO | null> {
    const prescriptionDoc =
      await this._patientHistoryRepository.findPrescriptionByAppointmentId(appointmentId);
    if (!prescriptionDoc) return null;

    return toPrescriptionDTO(prescriptionDoc);
  }

  async getAllReviews(doctorId: string): Promise<FeedbackDTO[]> {
    const feedback = await this._feedbackRepository.getFeedbacks(doctorId);

    return feedback.map(toFeedbackDTO);
  }

  async reportIssue(userId: string, subject: string, description: string): Promise<ComplaintTypes> {
    if (!userId) {
      throw new Error('Unauthorized user');
    }

    if (!subject && !description) {
      throw new Error('Please provide the detailed issue');
    }

    const user = await this._userRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this._complaintRepository.reportIssue(userId, subject, description);
  }
}
