import { IUserRepository } from "../../repositories/interface/IUserRepository";
import userModel, { userDocument } from "../../models/userModel";
import doctorModel, { DoctorDocument } from "../../models/doctorModel";
import slotModel from "../../models/slotModel";
import { AppointmentTypes } from "../../types/appointment";
import appointmentModel, { AppointmentDocument } from "../../models/appointmentModel";
import { DoctorTypes } from "../../types/doctor";
import { BaseRepository } from "../BaseRepository";
import { userTypes } from "../../types/user";
import { PaginationResult } from "../../types/pagination";

export class UserRepository
  extends BaseRepository<userDocument>
  implements IUserRepository
{
  constructor() {
    super(userModel);
  }

    async createUser(user: Partial<userDocument>): Promise<userDocument> {
    const createdUser = await this.create(user);
    return createdUser as userDocument;
  }

  async findUserById(id: string): Promise<userDocument | null> {
    const user = await this.findById(id);
    return user ? (user as userDocument) : null;
  }

  async findUserByEmail(email: string): Promise<userDocument | null> {
    return this.findOne({ email });
  }

  async updateUserById(id: string, data: Partial<userTypes>): Promise<void> {
  await userModel.findByIdAndUpdate(id, { $set: data });
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

  async bookAppointment(appointmentData: AppointmentTypes): Promise<AppointmentDocument> {
    const { userId, docId, slotDate, slotTime } = appointmentData;

    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) throw new Error("Doctor not available");

    const slotDoc = await slotModel.findOne({
      doctorId: docId,
      date: slotDate,
    });
    if (!slotDoc || slotDoc.isCancelled)
      throw new Error("No available slots for this date");

    const slotIndex = slotDoc.slots.findIndex(
      (slot) => slot.start === slotTime && !slot.booked
    );
    if (slotIndex === -1) throw new Error("Slot not available");

    slotDoc.slots[slotIndex].booked = true;
    await slotDoc.save();

    const userData = await userModel.findById(userId).select("-password").lean();
    const docData = await doctorModel.findById(docId).select("-password").lean();

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

    return await appointment.save();
  }

  async findAppointmentById(appointmentId: string): Promise<AppointmentDocument | null> {
  return await appointmentModel.findById(appointmentId).lean();
}

  // async getAppointmentsByUserId(userId: string): Promise<AppointmentDocument[]> {
  //   return appointmentModel.find({ userId }).sort({ date: -1 }).lean();
  // }

async getAppointmentsByUserIdPaginated(
  userId: string,
  page: number,
  limit: number
): Promise<PaginationResult<AppointmentDocument>> {
  const skip = (page - 1) * limit;
  const totalCount = await appointmentModel.countDocuments({ userId });

  const data = await appointmentModel
    .find({ userId })
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



  async findDoctorById(id: string): Promise<DoctorDocument | null> {
    return doctorModel.findById(id).select("-password") as any;
  }

  async cancelAppointment(
    userId: string,
    appointmentId: string
  ): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized action");
    }

    if (appointment.cancelled) {
      throw new Error("Appointment already cancelled");
    }

    appointment.cancelled = true;
    await appointment.save();

    const { docId, slotDate, slotTime } = appointment;
    const slotDoc = await slotModel.findOne({
      doctorId: docId,
      date: slotDate,
    });
    if (slotDoc) {
      const slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotTime && slot.booked
      );
      if (slotIndex !== -1) {
        slotDoc.slots[slotIndex].booked = false;
        await slotDoc.save();
      }
    }
  }

  async findPayableAppointment(
    userId: string,
    appointmentId: string
  ): Promise<any> {
    const appointment = await appointmentModel.findById<AppointmentTypes>(
      appointmentId
    );
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

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

  async getAvailableSlotsByDoctorAndMonth(
    doctorId: string,
    year: number,
    month: number
  ): Promise<any[]> {
    const regexMonth = String(month).padStart(2, "0");
    const regex = new RegExp(`^${year}-${regexMonth}`);

    return slotModel
      .find({
        doctorId,
        date: { $regex: regex },
        isCancelled: false,
        "slots.booked": false,
      })
      .select("date slots");
  }
}
