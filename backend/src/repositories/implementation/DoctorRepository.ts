import { BaseRepository } from "../BaseRepository";
import appointmentModel, { AppointmentDocument } from "../../models/appointmentModel";
import doctorModel, { DoctorDocument } from "../../models/doctorModel";
import { AppointmentTypes } from "../../types/appointment";
import { DoctorTypes } from "../../types/doctor";
import {
  IDoctorRepository,
} from "../interface/IDoctorRepository";
import { PaginationResult } from "../../types/pagination";

export class DoctorRepository
  extends BaseRepository<DoctorDocument>
  implements IDoctorRepository
{
  constructor() {
    super(doctorModel);
  }

  async registerDoctor(data: DoctorTypes): Promise<DoctorDocument> {
    return doctorModel.create(data);
  }

  async findByEmail(email: string): Promise<DoctorDocument | null> {
    return this.findOne({ email });
  }

  async save(doctor: DoctorDocument): Promise<void> {
    await doctor.save();
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await this.updateById(id, { available });
  }

  async findAllDoctors(): Promise<DoctorDocument[]> {
    return doctorModel.find({}).select("-password");
  }

  async findAppointmentsByDoctorId(docId: string): Promise<AppointmentDocument[]> {
    return appointmentModel.find({ docId });
  }

  async findAppointmentById(id: string): Promise<AppointmentDocument | null> {
    return appointmentModel.findById(id);
  }

  async markAppointmentAsConfirmed(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { isConfirmed: true });
  }

  async cancelAppointment(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { cancelled: true });
  }

  async getDoctorsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<DoctorDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await doctorModel.countDocuments({ status: "approved" });
    const data = await doctorModel
      .find({ status: "approved" })
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getAppointmentsPaginated(
    docId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await appointmentModel.countDocuments({ docId });
    const data = await appointmentModel
      .find({ docId })
      .populate("userId", "name email image dob")
      .populate("docId", "name image speciality")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async getDoctorProfileById(id: string): Promise<DoctorDocument | null> {
    return doctorModel.findById(id).select("-password");
  }

  async updateDoctorProfile(
    id: string,
    updateData: Partial<
      Pick<
        DoctorTypes,
        | "name"
        | "speciality"
        | "degree"
        | "experience"
        | "about"
        | "fees"
        | "address"
        | "image"
        | "available"
      >
    >
  ): Promise<void> {
    await this.updateById(id, updateData);
  }
}
