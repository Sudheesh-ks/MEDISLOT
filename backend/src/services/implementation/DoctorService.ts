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
} from "../../utils/jwt.utils";
import { DoctorDTO } from "../../dtos/doctor.dto";
import { toDoctorDTO } from "../../mappers/doctor.mapper";
import { AppointmentDTO } from "../../dtos/appointment.dto";
import { toAppointmentDTO } from "../../mappers/appointment.mapper";
import { PaginationResult } from "../../types/pagination";

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
      !address
    ) {
      throw new Error("All Fields Required");
    }

    const existing = await this._doctorRepository.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = "";
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      imageUrl = uploadResult.secure_url;
    }

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
const doctor = await this._doctorRepository.getDoctorProfileById(id);
if (!doctor) throw new Error("Doctor not found");
return toDoctorDTO(doctor);
  }

  async toggleAvailability(docId: string): Promise<void> {
    const doc = await this._doctorRepository.findById(docId);
    if (!doc) throw new Error("Doctor not found");

    await this._doctorRepository.updateAvailability(docId, !doc.available);
  }

  async getAllDoctors(): Promise<DoctorDTO[]> {
    const doctors = await this._doctorRepository.findAllDoctors();
    return doctors.map(toDoctorDTO);
  }

async getDoctorsPaginated(
  page: number,
  limit: number
): Promise<PaginationResult<DoctorDTO>> {
  const { data, totalCount, currentPage, totalPages, hasNextPage, hasPrevPage } =
    await this._doctorRepository.getDoctorsPaginated(page, limit);

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


  async loginDoctor(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string }> {
    const doctor = await this._doctorRepository.findByEmail(email);
    if (!doctor) throw new Error("Doctor not found");

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) throw new Error("Incorrect password");

    const token = generateAccessToken(doctor._id!, doctor.email, "doctor");
    const refreshToken = generateRefreshToken(doctor._id!);

    return { token, refreshToken };
  }

async getDoctorAppointments(docId: string): Promise<AppointmentDTO[]> {
  const doctor = await this._doctorRepository.findById(docId);
  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const appointments = await this._doctorRepository.findAppointmentsByDoctorId(docId);
  return appointments.map(toAppointmentDTO); 
}


  async getDoctorAppointmentsPaginated(
    docId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDTO>> {
    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

  const paginatedData = await this._doctorRepository.getAppointmentsPaginated(docId, page, limit);

  return {
    ...paginatedData,
    data: paginatedData.data.map(toAppointmentDTO), 
  };
  }

  async confirmAppointment(
    docId: string,
    appointmentId: string
  ): Promise<void> {
    const appointment = await this._doctorRepository.findAppointmentById(
      appointmentId
    );
    console.log(appointment?.docId);
    console.log(docId);
    if (!appointment || appointment.docId !== docId.toString()) {
      throw new Error("Mark Failed");
    }
    await this._doctorRepository.markAppointmentAsConfirmed(appointmentId);
  }

  async cancelAppointment(docId: string, appointmentId: string): Promise<void> {
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

  async updateDoctorProfile(data: {
    doctId: string;
    name: string;
    speciality: string;
    degree: string;
    experience: string;
    about: string;
    fees: number;
    address: DoctorTypes["address"];
    imagePath?: string;
    available?: boolean;
  }): Promise<void> {
    const doctor = await this._doctorRepository.findById(data.doctId);
    if (!doctor) throw new Error("Doctor not found");

    let imageUrl = doctor.image;

    if (data.imagePath) {
      try {
        const uploadResult = await cloudinary.uploader.upload(data.imagePath, {
          resource_type: "image",
        });
        imageUrl = uploadResult.secure_url;

        fs.unlink(data.imagePath, (err: any) => {
          if (err) console.error("Failed to delete local file:", err);
        });
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        throw new Error("Image upload failed");
      }
    }

    await this._doctorRepository.updateDoctorProfile(data.doctId, {
      name: data.name,
      speciality: data.speciality,
      degree: data.degree,
      experience: data.experience,
      about: data.about,
      fees: data.fees,
      address: data.address,
      image: imageUrl,
      ...(data.available !== undefined && { available: data.available }),
    });
  }
}
