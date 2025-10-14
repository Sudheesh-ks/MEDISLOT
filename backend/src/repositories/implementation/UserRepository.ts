import { IUserRepository } from '../../repositories/interface/IUserRepository';
import userModel, { userDocument } from '../../models/userModel';
import doctorModel, { DoctorDocument } from '../../models/doctorModel';
import slotModel, { SlotDocument } from '../../models/slotModel';
import { AppointmentTypes } from '../../types/appointment';
import appointmentModel, { AppointmentDocument } from '../../models/appointmentModel';
import { BaseRepository } from '../BaseRepository';
import { userTypes } from '../../types/user';
import { PaginationResult } from '../../types/pagination';
import dayjs from 'dayjs';

export class UserRepository extends BaseRepository<userDocument> implements IUserRepository {
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

  async updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean> {
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { $set: { password: newHashedPassword } }
    );
    return !!updatedUser;
  }
  async bookAppointment(appointmentData: AppointmentTypes): Promise<AppointmentDocument> {
    const { userId, docId, slotDate, slotStartTime, slotEndTime } = appointmentData;

    const doctor = await doctorModel.findById(docId);
    if (!doctor || !doctor.available) throw new Error('Doctor not available');

    let slotDoc = await slotModel.findOne({
      doctorId: docId,
      date: slotDate,
    });

    let slotIndex = -1;

    if (slotDoc && !slotDoc.isCancelled) {
      slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime && !slot.booked
      );
    }

    if (slotIndex === -1) {
      const weekday = dayjs(slotDate).day();
      const weeklyDefault = await slotModel.findOne({
        doctorId: docId,
        weekday,
        isDefault: true,
      });

      if (!weeklyDefault) {
        throw new Error('Slot not available');
      }

      const defIndex = weeklyDefault.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime && slot.isAvailable
      );

      if (defIndex === -1) {
        throw new Error('Slot not available');
      }

      slotDoc = await slotModel.findOneAndUpdate(
        { doctorId: docId, date: slotDate },
        {
          $setOnInsert: {
            doctorId: docId,
            date: slotDate,
            slots: weeklyDefault.slots.map((s) => ({
              ...s,
              booked: false,
            })),
          },
        },
        { upsert: true, new: true }
      );

      if (!slotDoc) {
        throw new Error('Failed to create or fetch slot document');
      }

      slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime
      );
    }

    if (slotIndex === -1) throw new Error('Slot not available');
    slotDoc!.slots[slotIndex].booked = true;
    await slotDoc!.save();

    const userData = await userModel.findById(userId).select('-password').lean();
    const docData = await doctorModel.findById(docId).select('-password').lean();

    const appointment = new appointmentModel({
      userId,
      docId,
      userData,
      docData,
      amount: docData!.fees,
      slotStartTime,
      slotEndTime,
      slotDate,
      date: new Date(),
    });

    return await appointment.save();
  }

  async findAppointmentById(appointmentId: string): Promise<AppointmentDocument | null> {
    return await appointmentModel.findById(appointmentId).lean();
  }

  async getAppointmentsByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;

    const filter: any = { userId };

    if (startDate || endDate) filter.slotDate = {};
    if (startDate) filter.slotDate.$gte = startDate.toISOString().slice(0, 10);
    if (endDate) filter.slotDate.$lte = endDate.toISOString().slice(0, 10);
    const totalCount = await appointmentModel.countDocuments(filter);

    const data = await appointmentModel
      .find(filter)
      .populate('userId', 'name email image dob')
      .populate('docId', 'name image speciality')
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

  async findActiveAppointment(userId: string): Promise<AppointmentDocument | null> {
    const now = new Date();

    const appointments = await appointmentModel.find({
      userId,
      payment: true,
      cancelled: false,
      isConfirmed: true,
    });

    for (const appt of appointments) {
      const start = new Date(`${appt.slotDate}T${appt.slotStartTime}:00`);
      const end = new Date(`${appt.slotDate}T${appt.slotEndTime}:00`);

      if (now >= start && now <= end) {
        return appt;
      }
    }

    return null;
  }

  async findDoctorById(id: string): Promise<DoctorDocument | null> {
    return doctorModel.findById(id).select('-password').lean() as Promise<DoctorDocument | null>;
  }

  async cancelAppointment(userId: string, appointmentId: string): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized action');
    }

    if (appointment.cancelled) {
      throw new Error('Appointment already cancelled');
    }

    appointment.cancelled = true;
    await appointment.save();

    const { docId, slotDate, slotStartTime } = appointment;
    const slotDoc = await slotModel.findOne({
      doctorId: docId,
      date: slotDate,
    });
    if (slotDoc) {
      const slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.booked
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
  ): Promise<AppointmentDocument> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    if (appointment.cancelled) throw new Error('Appointment cancelled');

    return appointment as AppointmentDocument;
  }

  async saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void> {
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
  ): Promise<SlotDocument[]> {
    const regexMonth = String(month).padStart(2, '0');
    const regex = new RegExp(`^${year}-${regexMonth}`);

    return slotModel
      .find({
        doctorId,
        date: { $regex: regex },
        isCancelled: false,
        'slots.booked': false,
      })
      .select('date slots');
  }
}
