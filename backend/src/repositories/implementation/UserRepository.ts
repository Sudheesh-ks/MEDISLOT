import { IUserRepository } from "../../repositories/interface/IUserRepository";
import userModel from "../../models/userModel";
import doctorModel from "../../models/doctorModel";
import { AppointmentDocument, AppointmentTypes } from "../../types/appointment";
import appointmentModel from "../../models/appointmentModel";
import { DoctorData } from "../../types/doctor";
import { BaseRepository } from "../BaseRepository";
import { UserDocument } from "../../types/user";

export class UserRepository
  extends BaseRepository<UserDocument>
  implements IUserRepository
{
  constructor() {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async updatePasswordByEmail(
    email: string,
    newHashedPassword: string
  ): Promise<boolean> {
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { $set: { password: newHashedPassword } }
    );
    return !!updatedUser;
  }

  async bookAppointment(appointmentData: AppointmentTypes): Promise<void> {
    const { userId, docId, slotDate, slotTime } = appointmentData;

    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) throw new Error("Doctor not available");

    const slots = (doctor.slots_booked || {}) as Record<string, string[]>;

    if (slots[slotDate]?.includes(slotTime)) {
      throw new Error("Slot not available");
    }

    if (!slots[slotDate]) slots[slotDate] = [];
    slots[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select("-password");
    const docData = await doctorModel.findById(docId).select("-password");

    const appointment = new appointmentModel({
      userId,
      docId,
      userData,
      docData,
      amount: docData!.fees,
      slotTime,
      slotDate,
      date: new Date(),
    });

    await appointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: slots });
  }

  async getAppointmentsByUserId(userId: string): Promise<AppointmentTypes[]> {
    return appointmentModel.find({ userId }).sort({ date: -1 });
  }

  async findDoctorById(id: string): Promise<DoctorData | null> {
    return doctorModel.findById(id).select("-password") as any;
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string
  ): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.userId.toString() !== userId) {
      throw new Error("Unauthorized action");
    }

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

  async findPayableAppointment(
    userId: string,
    appointmentId: string
  ): Promise<AppointmentDocument> {
    const appointment = await appointmentModel.findById<AppointmentDocument>(
      appointmentId
    );
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.userId.toString() !== userId)
      throw new Error("Unauthorized");
    if (appointment.cancelled) throw new Error("Appointment cancelled");
    return appointment;
  }

  async saveRazorpayOrderId(
    appointmentId: string,
    orderId: string
  ): Promise<void> {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      razorpayOrderId: orderId,
    });
  }

  async markAppointmentPaid(appointmentId: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
  }
}
