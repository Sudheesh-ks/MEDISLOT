import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils";
import { sendDoctorRejectionEmail } from "../../utils/mail.util";
import { DoctorDTO } from "../../dtos/doctor.dto";
import { UserDTO } from "../../dtos/user.dto";
import { AppointmentDTO } from "../../dtos/appointment.dto";
import { toUserDTO } from "../../mappers/user.mapper";
import { toAppointmentDTO } from "../../mappers/appointment.mapper";
import { AdminDTO } from "../../dtos/admin.dto";
import { toAdminDTO } from "../../mappers/admin.mapper";
import { PaginationResult } from "../../types/pagination";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { WalletDTO } from "../../dtos/wallet.dto";
import { toWalletDTO } from "../../mappers/wallet.mapper";
import { IWalletRepository } from "../../repositories/interface/IWalletRepository";
dotenv.config();

export class AdminService implements IAdminService {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _walletRepository: IWalletRepository
  ) {}

  async login(
    email?: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!email || !password) {
      throw new Error(HttpResponse.ADMIN_FIELDS_REQUIRED);
    }

    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error("Admin not found");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(
      admin._id.toString(),
      admin.email,
      "admin"
    );
    const refreshToken = generateRefreshToken(admin._id.toString());

    return { accessToken, refreshToken };
  }

  async refreshAdminToken(refreshToken?: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      throw new Error(HttpResponse.REFRESH_TOKEN_INVALID);
    }

    const admin = await this._adminRepository.findAdminById(decoded.id);
    if (!admin) throw new Error("Admin not found");

    const newAccessToken = generateAccessToken(
      admin._id.toString(),
      admin.email,
      "admin"
    );
    const newRefreshToken = generateRefreshToken(admin._id.toString());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getAdminById(id: string): Promise<AdminDTO | null> {
    const admin = await this._adminRepository.findAdminById(id);
    return admin ? toAdminDTO(admin) : null;
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<AdminDTO> {
    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error("Admin not found");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return toAdminDTO(admin);
  }

  async approveDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    if (doctor.status === "approved")
      throw new Error("Doctor already approved");

    doctor.status = "approved";
    await this._doctorRepository.save(doctor);
    return "Doctor approved successfully";
  }

  async rejectDoctor(doctorId: string, reason?: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    if (doctor.status === "rejected")
      throw new Error("Doctor already rejected");

    doctor.status = "rejected";
    if (reason) doctor.rejectionReason = reason;
    await this._doctorRepository.save(doctor);

    sendDoctorRejectionEmail(doctor.email, doctor.name, reason).catch((err) =>
      console.error("Rejection email failed:", err)
    );

    return "Doctor rejected and notified by email";
  }

  async getDoctors(): Promise<any[]> {
    return await this._adminRepository.getAllDoctors();
  }

  async getDoctorsPaginated(
    page: string,
    limit: string
  ): Promise<PaginationResult<DoctorDTO>> {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;

    return await this._adminRepository.getDoctorsPaginated(
      pageNumber,
      limitNumber
    );
  }

  async getUsersPaginated(
    page: string,
    limit: string
  ): Promise<PaginationResult<UserDTO>> {
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 8;

    const result = await this._adminRepository.getUsersPaginated(
      pageNumber,
      limitNumber
    );

    return {
      data: result.data.map(toUserDTO),
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async getUsers(): Promise<UserDTO[]> {
    const users = await this._adminRepository.getAllUsers();
    return users.map(toUserDTO);
  }

  async toggleUserBlock(userId: string, block: boolean): Promise<UserDTO> {
    if (typeof block !== "boolean") {
      throw new Error(HttpResponse.BLOCK_STATUS_INVALID);
    }

    const user = await this._adminRepository.toggleUserBlock(userId);
    return toUserDTO(user);
  }

  async listAppointments(): Promise<AppointmentDTO[]> {
    const appointments = await this._adminRepository.getAllAppointments();
    return appointments.map(toAppointmentDTO);
  }

  async listAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>> {
    const result = await this._adminRepository.getAppointmentsPaginated(
      page,
      limit
    );

    return {
      data: result.data.map(toAppointmentDTO),
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  }

  async cancelAppointment(appointmentId: string): Promise<void> {

    if (!appointmentId) throw new Error("Missing required fields");

    const appointment = await this._adminRepository.getAppointmentById(appointmentId);
    if (!appointment) {
      throw new Error("Cancellation Failed");
    }

     const amount = appointment.amount; // Assuming you store fee in appointment
  if (!amount || amount <= 0) return;


  const adminId = process.env.ADMIN_ID;
  const userId = appointment.userData._id.toString();
  const doctorId = appointment.docData._id.toString();
  const reason = `Refund for Cancelled Appointment (${appointment._id}) of ${appointment.docData.name}`;

  // console.log(adminId);
  // console.log(doctorId);
  // console.log(uId)

  // Credit full amount to user wallet
  await this._walletRepository.creditWallet(userId, "user", amount, reason);

  // Debit 80% from doctor
  const doctorShare = amount * 0.8;
  await this._walletRepository.debitWallet(doctorId, "doctor", doctorShare, reason);

  // Debit 20% from admin
  const adminShare = amount * 0.2;
  await this._walletRepository.debitWallet(adminId!, "admin", adminShare, reason);

    await this._adminRepository.cancelAppointment(appointmentId);
  }

  async getAdminWallet(): Promise<WalletDTO> {
  const adminId = process.env.ADMIN_ID;
  if (!adminId) throw new Error("ADMIN_USER_ID is not set in environment");

  const wallet = await this._walletRepository.getOrCreateWallet(adminId, "admin");
  if (!wallet) throw new Error("Admin wallet not found");

  return toWalletDTO(wallet);
}
}
