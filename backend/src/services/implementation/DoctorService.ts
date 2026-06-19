import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import bcrypt from 'bcrypt';
import { IDoctorService } from '../interface/IDoctorService';
import { DoctorTypes } from '../../types/Doctor';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/Jwt.utils';
import { DoctorDTO } from '../../dtos/Doctor.dto';
import { toDoctorDTO } from '../../mappers/Doctor.mapper';
import { PaginationResult } from '../../types/Pagination';
import { HttpResponse } from '../../constants/ResponseMessage.constants';
import { IWalletRepository } from '../../repositories/interface/IWalletRepository';
import { INotificationService } from '../interface/INotificationService';
import { Types } from 'mongoose';
import { IPatientHistoryRepository } from '../../repositories/interface/IPatientHistoryRepository';
import { patientHistoryTypes } from '../../types/PatientHistoryTypes';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { IComplaintRepository } from '../../repositories/interface/IComplaintRepository';
import { isValidPassword } from '../../utils/Validator';
import { WalletHistory } from '../../types/Wallet';
import { ComplaintDTO } from '../../dtos/Complaint.dto';
import { tocomplaintDTO } from '../../mappers/Complaint.mapper';
import { IAppointmentRepository } from '../../repositories/interface/IAppointmentRepository';

export interface DoctorDocument extends DoctorTypes {
  _id: string;
}

export class DoctorService implements IDoctorService {
  constructor(
    private readonly _doctorRepository: IDoctorRepository,
    private readonly _userRepository: IUserRepository,
    private readonly _walletRepository: IWalletRepository,
    private readonly _notificationService: INotificationService,
    private readonly _patientHistoryRepository: IPatientHistoryRepository,
    private readonly _complaintRepository: IComplaintRepository,
    private readonly _appointmentRepository: IAppointmentRepository
  ) {}

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
      certificate,
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
      !image ||
      !certificate
    ) {
      throw new Error('All Fields Required');
    }

    const existing = await this._doctorRepository.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = '';
    const [uploadResult, certificateUpload] = await Promise.all([
      cloudinary.uploader.upload(image, { resource_type: 'image', type: 'authenticated' }),
      cloudinary.uploader.upload(certificate, { resource_type: 'auto', type: 'authenticated' }),
    ]);

    imageUrl = uploadResult.public_id;

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
      certificate: certificateUpload.secure_url,
      date: new Date(),
      status: 'pending',
    };

    await this._doctorRepository.registerDoctor(doctorData);
  }

  async getPublicDoctorById(id: string): Promise<DoctorDTO> {
    if (!id) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findDoctorById(id);
    if (!doctor) throw new Error('Doctor not found');

    return toDoctorDTO(doctor);
  }

  async toggleAvailability(docId: string): Promise<void> {
    if (!docId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findById(docId);
    if (!doctor) throw new Error('Doctor not found');

    await this._doctorRepository.updateAvailability(docId, !doctor.available);
  }

  async getAllDoctors(): Promise<DoctorDTO[]> {
    const doctors = await this._doctorRepository.findAllDoctors();
    return doctors.map(toDoctorDTO);
  }

  async getDoctorsPaginated(query: any): Promise<PaginationResult<DoctorDTO>> {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 6;
    const search = query.search as string | undefined;
    const speciality = query.speciality as string | undefined;
    const minRating = query.minRating ? Number(query.minRating) : undefined;
    const sortOrder = query.sortOrder as string | undefined;

    const { data, totalCount, currentPage, totalPages, hasNextPage, hasPrevPage } =
      await this._doctorRepository.getDoctorsPaginated(
        page,
        limit,
        search,
        speciality,
        minRating,
        sortOrder
      );

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

    if (!email || !password) throw new Error('Email and password required');

    const doctor = await this._doctorRepository.findByEmail(email);
    if (!doctor) throw new Error(HttpResponse.INVALID_CREDENTIALS);

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) throw new Error(HttpResponse.INCORRECT_PASSWORD);

    const token = generateAccessToken(doctor._id.toString(), doctor.email, 'doctor');
    const refreshToken = generateRefreshToken(doctor._id.toString());

    return { token, refreshToken };
  }

  async refreshToken(refreshToken?: string): Promise<{ token: string; refreshToken: string }> {
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
    if (!doctor) throw new Error('Doctor not found');

    const newAccessToken = generateAccessToken(doctor._id!.toString(), doctor.email, 'doctor');
    const newRefreshToken = generateRefreshToken(doctor._id!.toString());

    return { token: newAccessToken, refreshToken: newRefreshToken };
  }

  async getDoctorProfile(docId: string): Promise<DoctorDTO> {
    const doctor = await this._doctorRepository.findDoctorById(docId);
    if (!doctor) throw new Error('Doctor not found');
    return toDoctorDTO(doctor);
  }

  async updateDoctorProfile(body: any, imageFile?: Express.Multer.File): Promise<void> {
    const { doctId, name, speciality, degree, experience, about, fees, address, available } = body;

    if (!doctId) throw new Error('Doctor ID is required');

    const doctor = await this._doctorRepository.findById(doctId);
    if (!doctor) throw new Error('Doctor not found');

    if (!name || typeof name !== 'string' || !name.trim()) throw new Error('Name is required');

    if (!speciality || !degree || !speciality.trim() || !degree.trim())
      throw new Error('Speciality and degree are required');

    const parsedExperience = parseInt(experience);
    if (isNaN(parsedExperience) || parsedExperience < 0)
      throw new Error('Experience must be a valid non-negative number');

    if (about && about.length > 500)
      throw new Error('About section is too long (max 500 characters)');

    const parsedFees = parseFloat(fees);
    if (isNaN(parsedFees) || parsedFees <= 0)
      throw new Error('Fees must be a valid number greater than 0');

    let parsedAddress;
    try {
      parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      if (
        !parsedAddress ||
        typeof parsedAddress !== 'object' ||
        !parsedAddress.line1?.trim() ||
        !parsedAddress.line2?.trim()
      ) {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      throw new Error('Address must include both line1 and line2');
    }

    let imageUrl = doctor.image;

    if (imageFile?.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
          type: 'authenticated',
        });
        imageUrl = uploadResult.public_id;
        fs.unlink(imageFile.path, (err) => {
          if (err) console.error('Failed to delete local file:', err);
        });
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        throw new Error('Image upload failed');
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
        available: String(available) === 'true',
      }),
    });
  }

  async changePassword(doctorId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const isMatch = await bcrypt.compare(oldPassword, doctor.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedpassword = await bcrypt.hash(newPassword, 10);

    await this._doctorRepository.updateDoctorById(doctorId, { password: hashedpassword });
  }

  async getDoctorWalletPaginated(
    doctorId: string,
    page: number,
    limit: number,
    search: string,
    period: string,
    txnType?: 'credit' | 'debit' | 'all',
    startDate?: string,
    endDate?: string
  ): Promise<{
    history: WalletHistory[];
    total: number;
    balance: number;
    filteredCredits: number;
    filteredDebits: number;
  }> {
    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    return await this._walletRepository.getWalletHistoryPaginated(
      doctorId,
      'doctor',
      page,
      limit,
      search,
      period,
      txnType,
      startDate,
      endDate
    );
  }

  async getDashboardData(doctorId: string, startDate: string, endDate: string) {
    const [revenueData, appointmentData] = await Promise.all([
      this._doctorRepository.getRevenueOverTime(doctorId, startDate, endDate),
      this._appointmentRepository.getAppointmentsOverTime(doctorId, startDate, endDate),
    ]);

    return {
      revenueData,
      appointmentData,
    };
  }

  async createPatientHistory(data: patientHistoryTypes): Promise<void> {
    const patientHistory = {
      ...data,
      doctorId: new Types.ObjectId(data.doctorId),
      patientId: new Types.ObjectId(data.patientId),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !data.date?.toString().trim() ||
      !data.time?.trim() ||
      !data.type?.trim() ||
      !data.chiefComplaint?.trim() ||
      !data.diagnosis?.trim() ||
      !Array.isArray(data.symptoms) ||
      data.symptoms.length === 0 ||
      !data.vitals ||
      Object.values(data.vitals).every((v) => !v?.trim?.()) ||
      !Array.isArray(data.prescription) ||
      data.prescription.length === 0 ||
      data.prescription.some(
        (p) =>
          !p.medication?.trim() ||
          !p.dosage?.trim() ||
          !p.frequency?.trim() ||
          !p.duration?.trim() ||
          !p.instructions?.trim()
      )
    ) {
      throw new Error('All required fields must be filled.');
    }

    const existingHistory = await this._patientHistoryRepository.findPrescriptionByAppointmentId(
      data.appointmentId.toString()
    );
    if (existingHistory) {
      throw new Error('History for this appointment already exists.');
    }

    await this._patientHistoryRepository.createHistory(patientHistory);
  }

  async updatePatientHistory(
    historyId: string,
    data: Partial<patientHistoryTypes>
  ): Promise<patientHistoryTypes | null> {
    return this._patientHistoryRepository.updateHistory(historyId, data);
  }

  async getPatientHistory(doctorId: string, userId: string) {
    return await this._patientHistoryRepository.findByDoctorAndPatient(doctorId, userId);
  }

  async getPatientHistoryById(historyId: string) {
    return await this._patientHistoryRepository.findHistoryById(historyId);
  }

  async getPatientById(patientId: string) {
    return await this._userRepository.findUserById(patientId);
  }

  async reportIssue(doctorId: string, subject: string, description: string): Promise<ComplaintDTO> {
    if (!doctorId) {
      throw new Error('Unauthorized doctor');
    }

    if (!subject && !description) {
      throw new Error('Please provide the detailed issue');
    }

    const doctor = await this._doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const complaint = await this._complaintRepository.reportDoctorIssue(
      doctorId,
      subject,
      description
    );
    return tocomplaintDTO(complaint);
  }
}
