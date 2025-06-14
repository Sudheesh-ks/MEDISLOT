import { IUserService } from "../interface/IUserService";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { userData } from "../../types/user";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import { AppointmentTypes } from "../../types/appointment";
import { isValidDateOfBirth, isValidPhone } from "../../utils/validator";
import { DoctorData } from "../../types/doctor";
import { PaymentService } from "./PaymentService";

export interface UserDocument extends userData {
  _id: string;
}

export class UserService implements IUserService {
  constructor(
    private _userRepository: IUserRepository,
    private _paymentService = new PaymentService()
  ) {}

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ token: string }> {
    if (!name || !email || !password) throw new Error("Missing Details");
    if (!validator.isEmail(email)) throw new Error("Invalid email");
    if (password.length < 8) throw new Error("Password too short");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = (await this._userRepository.create({
      name,
      email,
      password: hashedPassword,
    })) as UserDocument;
    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    return { token };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    if (user.isBlocked)
      throw new Error("Your account has been blocked by admin");

    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    return { token };
  }

  async getProfile(userId: string): Promise<userData | null> {
    return await this._userRepository.findById(userId);
  }

  async updateProfile(
    userId: string,
    data: Partial<userData>,
    imageFile?: Express.Multer.File
  ): Promise<void> {
    if (
      !data.name ||
      !data.phone ||
      !data.address ||
      !data.dob ||
      !data.gender
    ) {
      throw new Error("Please provide all details");
    }

    if (!isValidPhone(data.phone)) {
      throw new Error("Phone number must be 10 numbers");
    }

    if (!isValidDateOfBirth(data.dob)) {
      throw new Error("Enter a valid birth date");
    }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      data.image = imageUpload.secure_url;
    }

    await this._userRepository.updateById(userId, data);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userRepository.findByEmail(email);
    return !!user;
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async finalizeRegister(userData: userData) {
    return await this._userRepository.create(userData);
  }

  generateToken(userId: string): string {
    return Jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
  }

  async resetPassword(
    email: string,
    newHashedPassword: string
  ): Promise<boolean> {
    return await this._userRepository.updatePasswordByEmail(
      email,
      newHashedPassword
    );
  }

  async getUserById(id: string): Promise<UserDocument> {
    const user = await this._userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async getDoctorById(id: string): Promise<DoctorData> {
    const doctor = (await this._userRepository.findDoctorById(
      id
    )) as DoctorData | null;
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
  }

  async bookAppointment(appointmentData: AppointmentTypes): Promise<void> {
    await this._userRepository.bookAppointment(appointmentData);
  }

  async listUserAppointments(userId: string): Promise<AppointmentTypes[]> {
    return await this._userRepository.getAppointmentsByUserId(userId);
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string
  ): Promise<void> {
    await this._userRepository.cancelAppointment(userId, appointmentId);
  }

  async startPayment(
    userId: string,
    appointmentId: string
  ): Promise<{ order: any }> {
    const appointment = await this._userRepository.findPayableAppointment(
      userId,
      appointmentId
    );

    const order = await this._paymentService.createOrder(
      appointment.amount * 100,
      appointment._id.toString()
    );

    // await this._userRepository.saveRazorpayOrderId(appointmentId, order.id);

    return { order };
  }

  async verifyPayment(
    userId: string,
    appointmentId: string,
    razorpay_order_id: string
  ): Promise<void> {
    await this._userRepository.findPayableAppointment(userId, appointmentId);

    const orderInfo = await this._paymentService.fetchOrder(razorpay_order_id);

    if (orderInfo.status !== "paid") {
      throw new Error("Payment not completed");
    }

    if (orderInfo.receipt !== appointmentId) {
      throw new Error("Receipt / appointment mismatch");
    }

    await this._userRepository.markAppointmentPaid(appointmentId);
  }
}
