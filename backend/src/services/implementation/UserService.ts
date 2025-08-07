import { IUserService } from "../interface/IUserService";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { userTypes } from "../../types/user";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import { AppointmentTypes } from "../../types/appointment";
import {
  isValidDateOfBirth,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
} from "../../utils/validator";
import { DoctorTypes } from "../../types/doctor";
import { PaymentService } from "./PaymentService";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils";
import { SlotRepository } from "../../repositories/implementation/SlotRepository";
import { SlotRange } from "../../types/slots";
import { isoDate } from "../../utils/date.util";
import { UserDTO } from "../../dtos/user.dto";
import { toUserDTO } from "../../mappers/user.mapper";
import { userDocument } from "../../models/userModel";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { generateOTP } from "../../utils/otp.util";
import { otpStore } from "../../utils/otpStore";
import { sendOTP } from "../../utils/mail.util";
import { AppointmentDTO } from "../../dtos/appointment.dto";
import { toAppointmentDTO } from "../../mappers/appointment.mapper";
import { PaginationResult } from "../../types/pagination";
import { WalletRepository } from "../../repositories/implementation/WalletRepository";
import { WalletDTO } from "../../dtos/wallet.dto";

export interface UserDocument extends userTypes {
  _id: string;
}

const adminId = process.env.ADMIN_ID;

export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _paymentService = new PaymentService(),
    private readonly _slotRepository = new SlotRepository(),
    private readonly _walletRepository = new WalletRepository()
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
    console.log("Generated OTP:", otp);

    otpStore.set(email, {
      otp,
      purpose: "register",
      userData: { name, email, password: hashed },
    });

    try {
      await sendOTP(email, otp);
    } catch (error) {
      console.error("Email send failed:", error);
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

    if (purpose === "register") {
      const newUser = await this.finalizeRegister(record.userData);

      otpStore.delete(email);

      const refreshToken = generateRefreshToken(newUser._id!);
      return { purpose, user: newUser, refreshToken };
    }

    if (purpose === "reset-password") {
      otpStore.set(email, { ...record, otp: "VERIFIED" });
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
    if (existing) throw new Error("User already exists");

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
    console.log("New OTP:", newOtp);

    otpStore.set(email, { ...record, otp: newOtp });

    await sendOTP(email, newOtp);
  }

  async forgotPasswordRequest(email: string): Promise<void> {
    const userExists = await this.checkEmailExists(email);
    if (!userExists) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    otpStore.set(email, { otp, purpose: "reset-password", email });

    await sendOTP(email, otp);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const record = otpStore.get(email);

    if (
      !record ||
      record.purpose !== "reset-password" ||
      record.otp !== "VERIFIED"
    ) {
      throw new Error(HttpResponse.OTP_EXPIRED_OR_INVALID);
    }

    const hashed = await this.hashPassword(newPassword);
    const updated = await this._userRepository.updatePasswordByEmail(
      email,
      hashed
    );

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
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (user.isBlocked) {
      throw new Error("Your account has been blocked by admin");
    }

    const token = generateAccessToken(user._id.toString(), user.email, "user");
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: toUserDTO(user),
      token,
      refreshToken,
    };
  }

  async refreshToken(
    refreshToken?: string
  ): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      throw new Error(HttpResponse.REFRESH_TOKEN_INVALID);
    }

    const user = await this._userRepository.findUserById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    const newAccessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      "user"
    );
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
      throw new Error("Please provide all details");

    if (!isValidPhone(data.phone))
      throw new Error("Phone number must be 10 numbers");
    if (!isValidDateOfBirth(data.dob))
      throw new Error("Enter a valid birth date");

    if (
      typeof data.address !== "object" ||
      !data.address.line1?.trim() ||
      !data.address.line2?.trim()
    ) {
      throw new Error("Both address lines are required");
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      data.image = imageUpload.secure_url;
    }

    await this._userRepository.updateUserById(userId, data);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userRepository.findUserByEmail(email);
    return !!user;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this._userRepository.findUserById(id);
    if (!user) throw new Error("User not found");
    return user ? toUserDTO(user) : null;
  }

  async getDoctorById(id: string): Promise<DoctorTypes> {
    const doctor = await this._userRepository.findDoctorById(id);
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
  }

    async getUserWallet(userId: string): Promise<WalletDTO> {
      const doctor = await this._userRepository.findUserById(userId);
      if (!doctor) throw new Error('Doctor not found');
  
      const wallet = await this._walletRepository.getOrCreateWallet(userId, 'user');
      return wallet;
    }

  async bookAppointment({
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
  }): Promise<AppointmentDTO> {
    if (!userId || !docId || !slotDate || !slotStartTime || !slotEndTime) {
      throw new Error("All fields are required");
    }

    const user = await this._userRepository.findUserById(userId);
    if (!user) throw new Error("User not found");

    const doctor = await this._userRepository.findDoctorById(docId);
    if (!doctor) throw new Error("Doctor not found");

    const appointmentData: AppointmentTypes = {
      userId,
      docId,
      slotDate,
      slotStartTime,
      slotEndTime,
      userData: user,
      docData: doctor,
      amount: doctor.fees,
      date: Date.now(),
    };

    const booked = await this._userRepository.bookAppointment(appointmentData);
    return toAppointmentDTO(booked);
  }

  async listUserAppointmentsPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>> {
    const paginatedData =
      await this._userRepository.getAppointmentsByUserIdPaginated(
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
  if (!userId) throw new Error("User not found");

  const appointment = await this._userRepository.findActiveAppointment(userId);
  return appointment ? toAppointmentDTO(appointment) : null;
}


  async cancelAppointment(
    userId: string,
    appointmentId: string
  ): Promise<void> {
    if (!userId || !appointmentId) throw new Error("Missing required details");

    const appointment = await this._userRepository.findAppointmentById(
      appointmentId
    );
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized cancellation");
    }

    

     const amount = appointment.amount; // Assuming you store fee in appointment
  if (!amount || amount <= 0) return;

  const doctorId = appointment.docData._id.toString();
  const reason = `Refund for Cancelled Appointment (${appointment._id}) of ${appointment.docData.name}`;

  // console.log(adminId);
  // console.log(doctorId);
  // console.log(uId)

  // Credit full amount to user wallet
  await this._walletRepository.creditWallet(userId.toString(), "user", amount, reason);

  // Debit 80% from doctor
  const doctorShare = amount * 0.8;
  await this._walletRepository.debitWallet(doctorId, "doctor", doctorShare, reason);

  // Debit 20% from admin
  const adminShare = amount * 0.2;
  await this._walletRepository.debitWallet(adminId!, "admin", adminShare, reason);

  await this._userRepository.cancelAppointment(userId, appointmentId);
  }

  async startPayment(
    userId: string,
    appointmentId: string
  ): Promise<{ order: any }> {
    if (!userId || !appointmentId) {
      throw new Error("User ID and Appointment ID are required");
    }

    const appointment = await this._userRepository.findPayableAppointment(
      userId,
      appointmentId
    );
    if (!appointment || !appointment._id) {
      throw new Error("Invalid appointment for payment");
    }

    const amountInPaise = appointment.amount * 100;

    const order = await this._paymentService.createOrder(
      amountInPaise,
      appointment._id.toString()
    );

    return { order };
  }

  async verifyPayment(
    userId: string,
    appointmentId: string,
    razorpay_order_id: string
  ): Promise<void> {
    if (!userId || !appointmentId || !razorpay_order_id) {
      throw new Error("Missing required payment verification details");
    }

    const appointment = await this._userRepository.findPayableAppointment(
      userId,
      appointmentId
    );
    if (!appointment) {
      throw new Error("No payable appointment found");
    }

    const orderInfo = await this._paymentService.fetchOrder(razorpay_order_id);

    if (orderInfo.status !== "paid") {
      throw new Error("Payment not completed");
    }

    if (orderInfo.receipt !== appointmentId) {
      throw new Error("Receipt mismatch with appointment");
    }

    await this._userRepository.markAppointmentPaid(appointmentId);

     const amount = appointment.amount;
  const adminShare = Math.round(amount * 0.2);
  const doctorShare = amount - adminShare;

  if (!adminId) {
  throw new Error("Admin wallet ID not configured");
}


  // Credit Admin Wallet
  await this._walletRepository.creditWallet(
    adminId, 
    "admin",
    adminShare,
    `Admin share for appointment ${appointmentId} from ${appointment.userData.name} to ${appointment.docData.name}`
  );

  // Credit Doctor Wallet
  await this._walletRepository.creditWallet(
    appointment.docId.toString(),
    "doctor",
    doctorShare,
    `Doctor share for appointment ${appointmentId} from ${appointment.userData.name}`
  );
  }

  async getAvailableSlotsByDate(
    doctorId: string,
    date: string
  ): Promise<SlotRange[]> {
    if (!doctorId || !date) {
      throw new Error("doctorId and date are required");
    }

    const doc = await this._slotRepository.getSlotByDate(
      doctorId,
      isoDate(date)
    );

    return doc?.slots.filter((r) => r.isAvailable && !r.booked) ?? [];
  }

  async getAvailableSlotsForDoctor(
    doctorId: string,
    year: number,
    month: number
  ): Promise<any[]> {
    if (!doctorId || !year || !month) {
      throw new Error("doctorId, year, and month are required");
    }

    return this._userRepository.getAvailableSlotsByDoctorAndMonth(
      doctorId,
      year,
      month
    );
  }
}
