import { IAdminRepository } from "../interface/IAdminRepository";
import doctorModel from "../../models/doctorModel";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";
import userModel from "../../models/userModel";
import { adminData } from "../../types/admin";
import adminModel from "../../models/adminModel";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import appointmentModel from "../../models/appointmentModel";

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<adminData | null> {
    return (await adminModel.findOne({ email })) as adminData | null;
  }

  async saveDoctor(data: DoctorData): Promise<void> {
    const newDoctor = new doctorModel(data);
    await newDoctor.save();
  }

  async getAllDoctors(): Promise<Omit<DoctorData, "password">[]> {
    return await doctorModel.find({}).select("-password");
  }

  async getAllUsers(): Promise<Omit<userData, "password">[]> {
    return await userModel.find({}).select("-password");
  }

  async toggleUserBlock(userId: string): Promise<string> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user.isBlocked ? "User blocked" : "User unblocked";
  }

  async getAllAppointments():Promise<AppointmentDocument[]> {
    return await appointmentModel.find({});
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
      if (!slots[slotDate].length) delete slots[slotDate]; // tidy up
      doctor.slots_booked = slots;
      doctor.markModified('slots_booked');
      await doctor.save();
    }
  }
}
}
