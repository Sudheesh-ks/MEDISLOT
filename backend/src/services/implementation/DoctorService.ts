import { IDoctorRepository } from "../../repositories/interface/IDoctorRepository";
import bcrypt from "bcrypt";
import { IDoctorService } from "../interface/IDoctorService";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorTypes } from "../../types/doctor";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils";
import { DoctorDTO } from "../../dtos/doctor.dto";
import { toDoctorDTO } from "../../mappers/doctor.mapper";
import { AppointmentDTO } from "../../dtos/appointment.dto";
import { toAppointmentDTO } from "../../mappers/appointment.mapper";
import { PaginationResult } from "../../types/pagination";
import { HttpResponse } from "../../constants/responseMessage.constants";

export interface DoctorDocument extends DoctorTypes {
  _id: string;
}

export class DoctorService implements IDoctorService {
  constructor(private _doctorRepository: IDoctorRepository) {}

  async registerDoctor(data: DoctorTypes): Promise<void> {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image,
    } = data;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !image
    ) {
      throw new Error("All Fields Required");
    }

    const existing = await this._doctorRepository.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = "";
    const uploadResult = await cloudinary.uploader.upload(image, {
      resource_type: "image",
    });
    imageUrl = uploadResult.secure_url;

    const doctorData: DoctorTypes = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: imageUrl,
      date: new Date(),
      status: "pending",
    };

    await this._doctorRepository.registerDoctor(doctorData);
  }

  async getPublicDoctorById(id: string): Promise<DoctorDTO> {
    if (!id) throw new Error("Doctor ID is required");

    const doctor = await this._doctorRepository.getDoctorProfileById(id);
    if (!doctor) throw new Error("Doctor not found");

    const {
      _id,
      name,
      email,
      address,
      speciality,
      degree,
      experience,
      about,
      image,
      fees,
      available,
    } = doctor;

    return {
      _id,
      name,
      email,
      address,
      speciality,
      degree,
      experience,
      about,
      image,
      fees,
      available,
    };
  }

  async toggleAvailability(docId: string): Promise<void> {
    if (!docId) throw new Error("Doctor ID is required");

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error("Doctor not found");

    await this._doctorRepository.updateAvailability(docId, !doctor.available);
  }

  async getAllDoctors(): Promise<DoctorDTO[]> {
    const doctors = await this._doctorRepository.findAllDoctors();
    return doctors.map(toDoctorDTO);
  }

  async getDoctorsPaginated(query: any): Promise<PaginationResult<DoctorDTO>> {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 6;

    const {
      data,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
    } = await this._doctorRepository.getDoctorsPaginated(page, limit);

    const mappedData = data.map(toDoctorDTO);

    return {
      data: mappedData,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async loginDoctor(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; refreshToken: string }> {
    const { email, password } = data;

    if (!email || !password) throw new Error("Email and password required");

    const doctor = await this._doctorRepository.findByEmail(email);
    if (!doctor) throw new Error("Doctor not found");

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) throw new Error("Incorrect password");

    const token = generateAccessToken(doctor._id!, doctor.email, "doctor");
    const refreshToken = generateRefreshToken(doctor._id!);

    return { token, refreshToken };
  }

  async refreshToken(
    refreshToken?: string
  ): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error(HttpResponse.REFRESH_TOKEN_FAILED);
    }

    const doctor = await this.getDoctorProfile(decoded.id);
    if (!doctor) throw new Error("Doctor not found");

    const newAccessToken = generateAccessToken(
      doctor._id!,
      doctor.email,
      "doctor"
    );
    const newRefreshToken = generateRefreshToken(doctor._id!);

    return { token: newAccessToken, refreshToken: newRefreshToken };
  }

  async getDoctorAppointments(docId: string): Promise<AppointmentDTO[]> {
    if (!docId) throw new Error("Doctor ID is required");

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error("Doctor not found");

    const appointments =
      await this._doctorRepository.findAppointmentsByDoctorId(docId);
    return appointments.map(toAppointmentDTO);
  }

  async getDoctorAppointmentsPaginated(
    docId: string,
    pageQuery: string,
    limitQuery: string
  ): Promise<PaginationResult<AppointmentDTO>> {
    if (!docId) throw new Error("Doctor ID is required");

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error("Doctor not found");

    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 6;

    const paginatedData = await this._doctorRepository.getAppointmentsPaginated(
      docId,
      page,
      limit
    );

    return {
      ...paginatedData,
      data: paginatedData.data.map(toAppointmentDTO),
    };
  }

  async confirmAppointment(
    docId: string,
    appointmentId: string
  ): Promise<void> {
    if (!docId || !appointmentId) throw new Error("Missing required fields");

    const appointment = await this._doctorRepository.findAppointmentById(
      appointmentId
    );
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error("Mark Failed");
    }

    await this._doctorRepository.markAppointmentAsConfirmed(appointmentId);
  }

  async cancelAppointment(docId: string, appointmentId: string): Promise<void> {
    if (!docId || !appointmentId) throw new Error("Missing required fields");

    const appointment = await this._doctorRepository.findAppointmentById(
      appointmentId
    );
    if (!appointment || appointment.docId.toString() !== docId.toString()) {
      throw new Error("Cancellation Failed");
    }

    await this._doctorRepository.cancelAppointment(appointmentId);
  }

  async getDoctorProfile(docId: string): Promise<DoctorDTO> {
    const doctor = await this._doctorRepository.getDoctorProfileById(docId);
    if (!doctor) throw new Error("Doctor not found");
    return toDoctorDTO(doctor);
  }

  async updateDoctorProfile(
    body: any,
    imageFile?: Express.Multer.File
  ): Promise<void> {
    const {
      doctId,
      name,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      available,
    } = body;

    if (!doctId) throw new Error("Doctor ID is required");

    const doctor = await this._doctorRepository.findById(doctId);
    if (!doctor) throw new Error("Doctor not found");

    if (!name || typeof name !== "string" || !name.trim())
      throw new Error("Name is required");

    if (!speciality || !degree || !speciality.trim() || !degree.trim())
      throw new Error("Speciality and degree are required");

    const parsedExperience = parseInt(experience);
    if (isNaN(parsedExperience) || parsedExperience < 0)
      throw new Error("Experience must be a valid non-negative number");

    if (about && about.length > 500)
      throw new Error("About section is too long (max 500 characters)");

    const parsedFees = parseFloat(fees);
    if (isNaN(parsedFees) || parsedFees <= 0)
      throw new Error("Fees must be a valid number greater than 0");

    let parsedAddress;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
      if (
        !parsedAddress ||
        typeof parsedAddress !== "object" ||
        !parsedAddress.line1?.trim() ||
        !parsedAddress.line2?.trim()
      ) {
        throw new Error();
      }
    } catch (err) {
      throw new Error("Address must include both line1 and line2");
    }

    const isAvailable =
      available !== undefined
        ? String(available).toLowerCase() === "true"
        : doctor.available;

    let imageUrl = doctor.image;

    if (imageFile?.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        imageUrl = uploadResult.secure_url;
        fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Failed to delete local file:", err);
        });
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        throw new Error("Image upload failed");
      }
    }

    await this._doctorRepository.updateDoctorProfile(doctId, {
      name,
      speciality,
      degree,
      experience,
      about,
      fees: Number(fees),
      address: parsedAddress,
      image: imageUrl,
      ...(available !== undefined && {
        available: String(available) === "true",
      }),
    });
  }
}
