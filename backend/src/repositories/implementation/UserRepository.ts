import {
  userDataRepository,
  UserDocument,
} from "../../repositories/interface/IUserRepository";
import userModel from "../../models/userModel";
import { userData } from "../../types/user";
import doctorModel from "../../models/doctorModel";
import { AppointmentTypes } from "../../types/appointment";
import appointmentModel from "../../models/appointmentModel";
import { DoctorData } from "../../types/doctor";

export class UserRepository implements userDataRepository {
  async create(user: Partial<userData>): Promise<UserDocument> {
    return (await new userModel(user).save()) as UserDocument;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return (await userModel.findOne({ email })) as UserDocument | null;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return (await userModel
      .findById(id)
      .select("-password")) as UserDocument | null;
  }

  async updateById(id: string, data: Partial<userData>): Promise<void> {
    await userModel.findByIdAndUpdate(id, data);
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

  async findDoctorById(id: string): Promise<DoctorData | null> {
    return (await doctorModel
      .findById(id)
      .select("-password")) as DoctorData | null;
  }

  async getAppointmentsByUserId(userId: string): Promise<AppointmentTypes[]> {
    return await appointmentModel.find({userId}).sort({ date: -1 });
  }
}
