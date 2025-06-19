// repositories/impl/AdminRepository.ts

import { IAdminRepository } from "../interface/IAdminRepository";
import { BaseRepository } from "../BaseRepository";
import adminModel from "../../models/adminModel";
import doctorModel from "../../models/doctorModel";
import userModel from "../../models/userModel";
import appointmentModel from "../../models/appointmentModel";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";
import { AdminDocument } from "../../types/admin";
import { AppointmentDocument } from "../../types/appointment";

export class AdminRepository extends BaseRepository<AdminDocument> {
  constructor() {
    super(adminModel);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.findOne({ email });
  }

  async saveDoctor(data: DoctorData): Promise<void> {
    const newDoctor = new doctorModel(data);
    await newDoctor.save();
  }

  async getAllDoctors(): Promise<Omit<DoctorData, "password">[]> {
    return doctorModel.find({}).select("-password");
  }

  async getAllUsers(): Promise<Omit<userData, "password">[]> {
    return userModel.find({}).select("-password");
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
