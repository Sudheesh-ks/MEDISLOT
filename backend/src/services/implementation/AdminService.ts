import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import { adminData, AdminDocument } from "../../types/admin";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.utils";
import { PaginationResult } from "../../repositories/interface/IAdminRepository";
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
    admin: AdminDocument;
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

    return { admin, accessToken, refreshToken };
  }

  async getAdminById(id: string): Promise<AdminDocument | null> {
    return this._adminRepository.findAdminById(id);
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<adminData> {
    const admin = await this._adminRepository.findByEmail(email);
    if (!admin) throw new Error("Admin not found");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return admin;
  }

  // async addDoctor(data: DoctorDTO): Promise<string> {
  //   const {
  //     name,
  //     email,
  //     password,
  //     speciality,
  //     degree,
  //     experience,
  //     about,
  //     fees,
  //     address,
  //     imagePath,
  //   } = data;

  //   if (
  //     !name ||
  //     !email ||
  //     !password ||
  //     !speciality ||
  //     !degree ||
  //     !experience ||
  //     !about ||
  //     !fees ||
  //     !address
  //   ) {
  //     throw new Error("All Fields Required");
  //   }

  //   if (!isValidEmail(email)) {
  //     throw new Error("Invalid Email");
  //   }

  //   if (!isValidPassword(password)) {
  //     throw new Error(
  //       "Password must be at least 8 characters long, contain at least 1 letter, 1 number, and 1 special character"
  //     );
  //   }

  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(password, salt);

  //   let imageUrl = "";
  //   if (imagePath) {
  //     const uploadResult = await cloudinary.uploader.upload(imagePath, {
  //       resource_type: "image",
  //     });
  //     imageUrl = uploadResult.secure_url;
  //   }

  //   const doctorData: DoctorData = {
  //     name,
  //     email,
  //     image: imageUrl,
  //     password: hashedPassword,
  //     speciality,
  //     degree,
  //     experience,
  //     about,
  //     fees,
  //     address,
  //     date: new Date(),
  //   };

  //   await this._adminRepository.saveDoctor(doctorData);
  //   return "Doctor added successfully";
  // }

  async approveDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    if (doctor.status === "approved")
      throw new Error("Doctor already approved");

    doctor.status = "approved";
    await this._doctorRepository.save(doctor);
    return "Doctor approved successfully";
  }

  async rejectDoctor(doctorId: string): Promise<string> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    if (doctor.status === "rejected")
      throw new Error("Doctor already rejected");

    doctor.status = "rejected";
    await this._doctorRepository.save(doctor);
    return "Doctor rejected successfully";
  }

  async getDoctors(): Promise<any[]> {
    return await this._adminRepository.getAllDoctors();
  }

  async getDoctorsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<any>> {
    return await this._adminRepository.getDoctorsPaginated(page, limit);
  }

  async getUsers(): Promise<any[]> {
    return await this._adminRepository.getAllUsers();
  }

  async getUsersPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<any>> {
    return await this._adminRepository.getUsersPaginated(page, limit);
  }

  async toggleUserBlock(userId: string, block: boolean): Promise<string> {
    return await this._adminRepository.toggleUserBlock(userId);
  }

  async listAppointments(): Promise<AppointmentDocument[]> {
    return await this._adminRepository.getAllAppointments();
  }

  async listAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentTypes>> {
    return await this._adminRepository.getAppointmentsPaginated(page, limit);
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    await this._adminRepository.cancelAppointment(appointmentId);
  }
}
