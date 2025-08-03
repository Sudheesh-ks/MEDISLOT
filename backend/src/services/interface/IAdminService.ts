import { UserDTO } from "../../dtos/user.dto";
import { AppointmentDTO } from "../../dtos/appointment.dto";
import { DoctorTypes } from "../../types/doctor";
import { adminTypes } from "../../types/admin";
import { DoctorDTO } from "../../dtos/doctor.dto";
import { AdminDTO } from "../../dtos/admin.dto";
import { PaginationResult } from "../../types/pagination";
import { WalletDTO } from "../../dtos/wallet.dto";

export interface DoctorInput extends DoctorTypes {
  imageFile?: Express.Multer.File;
}

export interface IAdminService {
  login(
    email?: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  refreshAdminToken(refreshToken?: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
  getAdminById(id: string): Promise<AdminDTO | null>;
  validateCredentials(email: string, password: string): Promise<AdminDTO>;
  getDoctors(): Promise<DoctorDTO[]>;
  getDoctorsPaginated(
    page: string,
    limit: string
  ): Promise<PaginationResult<DoctorDTO>>;
  getUsers(): Promise<UserDTO[]>;
  getUsersPaginated(
    page: string,
    limit: string
  ): Promise<PaginationResult<UserDTO>>;
  toggleUserBlock(userId: string, block: boolean): Promise<UserDTO>;
  listAppointments(): Promise<AppointmentDTO[]>;
  listAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>>;
  cancelAppointment(appointmentId: string): Promise<void>;
  approveDoctor(doctorId: string): Promise<string>;
  rejectDoctor(doctorId: string, reason?: string): Promise<string>;
  getAdminWallet(): Promise<WalletDTO>;
}
