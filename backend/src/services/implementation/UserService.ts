import { IUserService } from '../interface/IUserService';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { userTypes } from '../../types/user';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { AppointmentTypes } from '../../types/appointment';
import {
  isValidDateOfBirth,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
} from '../../utils/validator';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { SlotRange } from '../../types/slots';
import { isoDate } from '../../utils/date.util';
import { UserDTO } from '../../dtos/user.dto';
import { toUserDTO } from '../../mappers/user.mapper';
import { userDocument } from '../../models/userModel';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { generateOTP } from '../../utils/otp.util';
import { otpStore } from '../../utils/otpStore';
import { sendOTP } from '../../utils/mail.util';
import { AppointmentDTO } from '../../dtos/appointment.dto';
import { toAppointmentDTO } from '../../mappers/appointment.mapper';
import { PaginationResult } from '../../types/pagination';
import { WalletDTO } from '../../dtos/wallet.dto';
import { PrescriptionDTO } from '../../dtos/prescription.dto';
import { toPrescriptionDTO } from '../../mappers/prescription.mapper';
import { ioInstance } from '../../sockets/ChatSocket';
import { FeedbackDTO } from '../../dtos/feedback.dto';
import { toFeedbackDTO } from '../../mappers/feedback.mapper';
import { ComplaintTypes } from '../../types/complaint';
import { IPaymentService } from '../interface/IPaymentService';
import { ISlotRepository } from '../../repositories/interface/ISlotRepository';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { IFeedbackRepository } from '../../repositories/interface/IFeedbackRepository';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { IPatientHistoryRepository } from '../../repositories/interface/IPatientHistoryRepository';
import { DoctorDTO } from '../../dtos/doctor.dto';
import { generateShortAppointmentId } from '../../utils/generateApptId.utils';
import { RazorpayOrderDTO } from '../../types/payment';
import { slotDTO } from '../../dtos/slot.dto';
import { ISlotService } from '../interface/ISlotService';
import { ITempAppointmentRepository } from '../../repositories/interface/ITempAppointmentRepository';
import { toDoctorDTO } from '../../mappers/doctor.mapper';

export interface UserDocument extends userTypes {
  _id: string;
}

const adminId = process.env.ADMIN_ID;

export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _paymentService: IPaymentService,
    private readonly _slotService: ISlotService,
    private readonly _slotRepository: ISlotRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _feedbackRepository: IFeedbackRepository,
    private readonly _complaintRepository: IComplaintRepository,
    private readonly _patientHistoryRepository: IPatientHistoryRepository,
    private readonly _tempAppointmentRepository: ITempAppointmentRepository
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

    otpStore.set(email, {
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
    const record = otpStore.get(email);

    if (!record || record.otp !== otp) {
      throw new Error(HttpResponse.OTP_INVALID);
    }

    const { purpose } = record;

    if (purpose === 'register') {
      const newUser = await this.finalizeRegister(record.userData);

      otpStore.delete(email);

      const refreshToken = generateRefreshToken(newUser._id!);
      return { purpose, user: newUser, refreshToken };
    }

    if (purpose === 'reset-password') {
      otpStore.set(email, { ...record, otp: 'VERIFIED' });
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
    const record = otpStore.get(email);

    if (!record) {
      throw new Error(HttpResponse.OTP_NOT_FOUND);
    }

    const newOtp = generateOTP();
    console.log('New OTP:', newOtp);

    otpStore.set(email, { ...record, otp: newOtp });

    await sendOTP(email, newOtp);
  }

  async forgotPasswordRequest(email: string): Promise<void> {
    const userExists = await this.checkEmailExists(email);
    if (!userExists) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    otpStore.set(email, { otp, purpose: 'reset-password', email });

    await sendOTP(email, otp);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const record = otpStore.get(email);

    if (!record || record.purpose !== 'reset-password' || record.otp !== 'VERIFIED') {
      throw new Error(HttpResponse.OTP_EXPIRED_OR_INVALID);
    }

    const hashed = await this.hashPassword(newPassword);
    const updated = await this._userRepository.updatePasswordByEmail(email, hashed);

    if (!updated) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    otpStore.delete(email);
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

    if (!isValidPhone(data.phone)) throw new Error('Phone number must be 10 numbers');
    if (!isValidDateOfBirth(data.dob)) throw new Error('Enter a valid birth date');

    if (
      typeof data.address !== 'object' ||
      !data.address.line1?.trim() ||
      !data.address.line2?.trim()
    ) {
      throw new Error('Both address lines are required');
    }

    if (imageFile) {
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
    const doctor = await this._userRepository.findDoctorById(id);
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

  //   async bookAppointment({
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
  // }): Promise<AppointmentDTO> {
  //   if (!userId || !docId || !slotDate || !slotStartTime || !slotEndTime) {
  //     throw new Error('All fields are required');
  //   }

  //   // 1️⃣ Lock the slot first
  //   await this._slotService.lockSlot(docId, isoDate(slotDate), slotStartTime, slotEndTime, userId);

  //   // 2️⃣ Fetch user and doctor
  //   const [user, doctor] = await Promise.all([
  //     this._userRepository.findUserById(userId),
  //     this._userRepository.findDoctorById(docId),
  //   ]);

  //   if (!user) throw new Error('User not found');
  //   if (!doctor) throw new Error('Doctor not found');

  //   // 3️⃣ Prepare appointment
  //   const appointmentData: AppointmentTypes = {
  //     userId,
  //     docId,
  //     slotDate,
  //     slotStartTime,
  //     slotEndTime,
  //     userData: user,
  //     docData: doctor,
  //     amount: doctor.fees,
  //     date: Date.now(),
  //   };

  //   // 4️⃣ Save appointment
  //   const booked = await this._userRepository.bookAppointment(appointmentData);

  //   return toAppointmentDTO(booked);
  // }

  async initiateBooking({
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
  }): Promise<{ lockExpiresAt: Date; order: RazorpayOrderDTO; tempBookingId: string }> {
    if (!userId || !docId || !slotDate || !slotStartTime || !slotEndTime) {
      throw new Error('All fields are required');
    }

    const existingTempAppointment = await this._tempAppointmentRepository.findActiveTempAppointment(
      docId,
      slotDate,
      slotStartTime,
      slotEndTime
    );

    if (existingTempAppointment) {
      throw new Error('Slot temporarily unavailable - another user is booking this slot');
    }

    const [user, doctor] = await Promise.all([
      this._userRepository.findUserById(userId),
      this._userRepository.findDoctorById(docId),
    ]);

    if (!user) throw new Error('User not found');
    if (!doctor) throw new Error('Doctor not found');

    const amountInPaise = doctor.fees * 100;
    if (!amountInPaise || amountInPaise <= 0) {
      throw new Error('Invalid appointment amount');
    }

    const order = await this._paymentService.createOrder(amountInPaise, `temp_${Date.now()}`);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const tempAppointmentData = {
      userId,
      docId,
      slotDate,
      slotStartTime,
      slotEndTime,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      razorpayOrderId: order.id,
      status: 'pending_payment' as const,
      expiresAt,
    };

    const tempAppointment =
      await this._tempAppointmentRepository.createTempAppointment(tempAppointmentData);

    console.log(`Temporary appointment created: ${tempAppointment._id}`);
    console.log(`Expires at: ${expiresAt}`);

    return {
      lockExpiresAt: expiresAt,
      order,
      tempBookingId: tempAppointment._id.toString(),
    };
  }

  async listUserAppointmentsPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>> {
    const paginatedData = await this._userRepository.getAppointmentsByUserIdPaginated(
      userId,
      page,
      limit
    );

    return {
      ...paginatedData,
      data: paginatedData.data.map(toAppointmentDTO),
    };
  }

  async getActiveAppointment(userId: string): Promise<AppointmentDTO | null> {
    if (!userId) throw new Error('User not found');

    const appointment = await this._userRepository.findActiveAppointment(userId);
    return appointment ? toAppointmentDTO(appointment) : null;
  }

  async cancelAppointment(userId: string, appointmentId: string): Promise<void> {
    if (!userId || !appointmentId) throw new Error('Missing required details');

    const appointment = await this._userRepository.findAppointmentById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized cancellation');
    }

    if (!appointment.payment) {
      await this._userRepository.cancelAppointment(userId, appointmentId);
      return;
    }

    const amount = appointment.amount;
    if (!amount || amount <= 0) return;

    const doctorId = appointment.docData._id.toString();
    const reason = `Refund for Cancelled Appointment ${generateShortAppointmentId(appointment._id.toString())} of ${appointment.docData.name}`;

    // await this._walletRepository.creditWallet(userId.toString(), 'user', amount, reason);

    const doctorShare = amount * 0.8;
    // await this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason);

    const adminShare = amount * 0.2;
    // await this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason);

    // await this._userRepository.cancelAppointment(userId, appointmentId);

    // await this._notificationService.sendNotification({
    //   recipientId: doctorId,
    //   recipientRole: 'doctor',
    //   type: 'appointment',
    //   title: 'Appointment Canceled',
    //   message: `User ${appointment.userData.name} canceled the appointment. ₹${doctorShare} refunded to user from your wallet.`,
    //   link: '/doctor/appointments',
    // });

    // await this._notificationService.sendNotification({
    //   recipientId: adminId,
    //   recipientRole: 'admin',
    //   type: 'appointment',
    //   title: 'Appointment Canceled by User',
    //   message: `Appointment between ${appointment.userData.name} and ${appointment.docData.name} was canceled. ₹${adminShare} refunded to user from your wallet.`,
    //   link: '/admin/appointments',
    // });
    await Promise.all([
      this._walletRepository.creditWallet(userId.toString(), 'user', amount, reason),
      this._walletRepository.debitWallet(doctorId, 'doctor', doctorShare, reason),
      this._walletRepository.debitWallet(adminId!, 'admin', adminShare, reason),
      this._userRepository.cancelAppointment(userId, appointmentId),
      this._slotService.releaseSlotLock(
        doctorId,
        appointment.slotDate,
        appointment.slotStartTime,
        appointment.slotEndTime,
        userId
      ),
      this._notificationService.sendNotification({
        recipientId: doctorId,
        recipientRole: 'doctor',
        type: 'appointment',
        title: 'Appointment Canceled',
        message: `User ${appointment.userData.name} canceled the appointment. ₹${doctorShare} refunded to user from your wallet.`,
        link: '/doctor/appointments',
      }),
      this._notificationService.sendNotification({
        recipientId: adminId,
        recipientRole: 'admin',
        type: 'appointment',
        title: 'Appointment Canceled by User',
        message: `Appointment between ${appointment.userData.name} and ${appointment.docData.name} was canceled. ₹${adminShare} refunded to user from your wallet.`,
        link: '/admin/appointments',
      }),
    ]);

    if (ioInstance) {
      ioInstance.to(doctorId).emit('notification', {
        title: `Appointment cancelled by ${appointment.userData.name}`,
        link: '/doctor/appointments',
      });
    }
  }

  async startPayment(userId: string, appointmentId: string): Promise<{ order: RazorpayOrderDTO }> {
    if (!userId || !appointmentId) {
      throw new Error('User ID and Appointment ID are required');
    }

    const appointment = await this._userRepository.findPayableAppointment(userId, appointmentId);
    if (!appointment || !appointment._id) {
      throw new Error('Invalid appointment for payment');
    }

    const amountInPaise = appointment.amount * 100;

    const order = await this._paymentService.createOrder(amountInPaise, appointment._id.toString());

    return { order };
  }

  // async verifyPayment(
  //   userId: string,
  //   appointmentId: string,
  //   razorpay_order_id: string
  // ): Promise<void> {
  //   if (!userId || !appointmentId || !razorpay_order_id) {
  //     throw new Error('Missing required payment verification details');
  //   }

  //   const appointment = await this._userRepository.findPayableAppointment(userId, appointmentId);
  //   if (!appointment) {
  //     throw new Error('No payable appointment found');
  //   }

  //   const orderInfo = await this._paymentService.fetchOrder(razorpay_order_id);

  //   if (orderInfo.status !== 'paid') {
  //     throw new Error('Payment not completed');
  //   }

  //   if (orderInfo.receipt !== appointmentId) {
  //     throw new Error('Receipt mismatch with appointment');
  //   }

  //   await this._userRepository.markAppointmentPaid(appointmentId);

  //   const amount = appointment.amount;
  //   const adminShare = Math.round(amount * 0.2);
  //   const doctorShare = amount - adminShare;

  //   if (!adminId) {
  //     throw new Error('Admin wallet ID not configured');
  //   }

  //   // await this._walletRepository.creditWallet(
  //   //   adminId,
  //   //   'admin',
  //   //   adminShare,
  //   //   `Admin share for appointment ${generateShortAppointmentId(appointmentId)} from ${appointment.userData.name} to ${appointment.docData.name}`
  //   // );

  //   // await this._walletRepository.creditWallet(
  //   //   appointment.docId.toString(),
  //   //   'doctor',
  //   //   doctorShare,
  //   //   `Doctor share for appointment ${generateShortAppointmentId(appointmentId)} from ${appointment.userData.name}`
  //   // );

  //   await Promise.all([
  //     this._walletRepository.creditWallet(
  //       adminId,
  //       'admin',
  //       adminShare,
  //       `Admin share for appointment ${generateShortAppointmentId(appointmentId)} from ${appointment.userData.name} to ${appointment.docData.name}`
  //     ),

  //     this._walletRepository.creditWallet(
  //       appointment.docId.toString(),
  //       'doctor',
  //       doctorShare,
  //       `Doctor share for appointment ${generateShortAppointmentId(appointmentId)} from ${appointment.userData.name}`
  //     ),
  //   ]);
  // }

  async verifyPayment(userId: string, tempBookingId: string, razorpay_order_id: string) {
    const tempAppointment =
      await this._tempAppointmentRepository.findTempAppointmentById(tempBookingId);
    if (!tempAppointment) {
      throw new Error('Temporary appointment not found or expired');
    }

    if (tempAppointment.expiresAt < new Date()) {
      throw new Error('Temporary appointment has expired');
    }

    if (tempAppointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized access to temporary appointment');
    }

    const orderInfo = await this._paymentService.fetchOrder(razorpay_order_id);
    if (orderInfo.status !== 'paid') {
      throw new Error('Payment not completed');
    }

    if (orderInfo.id !== tempAppointment.razorpayOrderId) {
      throw new Error('Order ID mismatch');
    }

    const appointmentData: AppointmentTypes = {
      userId: tempAppointment.userId,
      docId: tempAppointment.docId,
      slotDate: tempAppointment.slotDate,
      slotStartTime: tempAppointment.slotStartTime,
      slotEndTime: tempAppointment.slotEndTime,
      userData: tempAppointment.userData,
      docData: tempAppointment.docData,
      amount: tempAppointment.amount,
      date: Date.now(),
      payment: true,
    };

    const booked = await this._userRepository.bookAppointment(appointmentData);
    await this._userRepository.markAppointmentPaid(booked._id.toString());

    await Promise.all([
      this._slotRepository.markSlotBooked(
        tempAppointment.docId,
        tempAppointment.slotDate,
        tempAppointment.slotStartTime,
        tempAppointment.slotEndTime
      ),
      this._tempAppointmentRepository.deleteTempAppointment(tempBookingId),
    ]);

    console.log(`Appointment created successfully: ${booked._id}`);
    console.log(`Temporary appointment cleaned up: ${tempBookingId}`);

    return toAppointmentDTO(booked);
  }

  async cancelTempBooking(tempBookingId: string): Promise<any> {
    console.log(`Attempting to cancel temp booking: ${tempBookingId}`);

    const tempAppointment =
      await this._tempAppointmentRepository.findTempAppointmentById(tempBookingId);

    if (!tempAppointment) {
      console.log('No temp appointment found');
      return;
    }

    console.log('Temp appointment data:', {
      id: tempAppointment._id,
      userId: tempAppointment.userId,
      docId: tempAppointment.docId,
      slotDate: tempAppointment.slotDate,
      slotStartTime: tempAppointment.slotStartTime,
      slotEndTime: tempAppointment.slotEndTime,
      status: tempAppointment.status,
      expiresAt: tempAppointment.expiresAt,
    });

    // Update status to cancelled and delete the temp appointment
    await this._tempAppointmentRepository.updateTempAppointmentStatus(tempBookingId, 'cancelled');
    await this._tempAppointmentRepository.deleteTempAppointment(tempBookingId);

    console.log('Temp appointment cancelled and deleted successfully');
  }

  async cleanupExpiredLocks(): Promise<void> {
    try {
      const deletedCount = await this._tempAppointmentRepository.cleanupExpiredTempAppointments();
      console.log(`Cleaned up ${deletedCount} expired temp appointments`);
    } catch (error) {
      console.error('Error cleaning up expired temp appointments:', error);
    }
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

    return this._userRepository.getAvailableSlotsByDoctorAndMonth(doctorId, year, month);
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
    const feedbackDoc = await this._feedbackRepository.submitFeedback(
      userId,
      apptId,
      message,
      rating
    );
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

    return this._complaintRepository.reportIssue(userId, subject, description);
  }
}
