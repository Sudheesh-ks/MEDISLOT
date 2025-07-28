import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import {
  generateAccessToken,
  generateRefreshToken,
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
dotenv.config();

export class AdminService implements IAdminService {
  constructor(
    private readonly _adminRepository: IAdminRepository,
    private readonly _doctorRepository: IDoctorRepository
  ) {}

  async login(
    email: string,
    password: string
  ): Promise<{
    admin: AdminDTO;
    accessToken: string;
    refreshToken: string;
  }> {
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

    return { 
      admin: toAdminDTO(admin), 
      accessToken, 
      refreshToken 
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
    page: number,
    limit: number
  ): Promise<PaginationResult<DoctorDTO>> {
    return await this._adminRepository.getDoctorsPaginated(page, limit);
  }

  async getUsers(): Promise<UserDTO[]> {
  const users = await this._adminRepository.getAllUsers();
  return users.map(toUserDTO);
  }

async getUsersPaginated(
  page: number,
  limit: number
): Promise<PaginationResult<UserDTO>> {
  const result = await this._adminRepository.getUsersPaginated(page, limit);

  return {
    data: result.data.map(toUserDTO),
    totalCount: result.totalCount,
    currentPage: result.currentPage,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

  async toggleUserBlock(userId: string, block: boolean): Promise<string> {
    return await this._adminRepository.toggleUserBlock(userId);
  }

  async listAppointments(): Promise<AppointmentDTO[]> {
  const appointments = await this._adminRepository.getAllAppointments();
  return appointments.map(toAppointmentDTO);
  }

async listAppointmentsPaginated(
  page: number,
  limit: number
): Promise<PaginationResult<AppointmentDTO>> {
  const result = await this._adminRepository.getAppointmentsPaginated(page, limit);

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
    await this._adminRepository.cancelAppointment(appointmentId);
  }
}
