import {
  IAdminRepository,
} from "../interface/IAdminRepository";
import { BaseRepository } from "../BaseRepository";
import adminModel, { AdminDocument } from "../../models/adminModel";
import doctorModel, { DoctorDocument } from "../../models/doctorModel";
import userModel, { userDocument } from "../../models/userModel";
import appointmentModel, { AppointmentDocument } from "../../models/appointmentModel";
import { DoctorTypes } from "../../types/doctor";
import { userTypes } from "../../types/user";
import { AppointmentTypes } from "../../types/appointment";
import { PaginationResult } from "../../types/pagination";

export class AdminRepository extends BaseRepository<AdminDocument> {
  constructor() {
    super(adminModel);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.findOne({ email });
  }

  async findAdminById(id: string): Promise<AdminDocument | null> {
    return this.findById(id);
  }

  // async saveDoctor(data: DoctorData): Promise<void> {
  //   const newDoctor = new doctorModel(data);
  //   await newDoctor.save();
  // }

  async getAllDoctors(): Promise<DoctorDocument[]> {
    return doctorModel.find({}).select("-password");
  }

  async getDoctorsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<DoctorDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await doctorModel.countDocuments({});
    const data = await doctorModel
      .find({})
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

  async getAllUsers(): Promise<userDocument[]> {
    return userModel.find({}).select("-password");
  }

  async getUsersPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<userDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await userModel.countDocuments({});
    const data = await userModel
      .find({})
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

  async toggleUserBlock(userId: string): Promise<string> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user.isBlocked ? "User blocked" : "User unblocked";
  }

  async getAllAppointments(): Promise<AppointmentDocument[]> {
    return appointmentModel.find({});
  }

  async getAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await appointmentModel.countDocuments({});
    const data = await appointmentModel
      .find({})
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

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.cancelled) {
      throw new Error("Appointment already cancelled");
    }

    appointment.cancelled = true;
    await appointment.save();

    const { docId, slotDate, slotTime } = appointment;
    const doctor = await doctorModel.findById(docId);
    if (doctor) {
      const slots = doctor.slots_booked || {};
      if (Array.isArray(slots[slotDate])) {
        slots[slotDate] = slots[slotDate].filter((t: string) => t !== slotTime);
        if (!slots[slotDate].length) delete slots[slotDate];
        doctor.slots_booked = slots;
        doctor.markModified("slots_booked");
        await doctor.save();
      }
    }
  }
}
