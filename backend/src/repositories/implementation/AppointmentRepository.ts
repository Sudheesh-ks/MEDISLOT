import dayjs from 'dayjs';
import appointmentModel, { AppointmentDocument } from '../../models/AppointmentModel';
import doctorModel from '../../models/DoctorModel';
import slotModel from '../../models/SlotModel';
import userModel from '../../models/UserModel';
import { AppointmentTypes } from '../../types/Appointment';
import { PaginationResult } from '../../types/Pagination';
import { BaseRepository } from '../BaseRepository';
import { IAppointmentRepository } from '../interface/IAppointmentRepository';
import { FilterQuery, PipelineStage } from 'mongoose';
import { getDateRange } from '../../utils/DateRange.util';

export class AppointmentRepository
  extends BaseRepository<AppointmentDocument>
  implements IAppointmentRepository
{
  constructor() {
    super(appointmentModel);
  }

  async bookAppointment(appointmentData: AppointmentTypes): Promise<AppointmentDocument> {
    const { userId, docId, slotDate, slotStartTime, slotEndTime, patientDetails } = appointmentData;

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

    const updatedSlot = await slotModel.findOneAndUpdate(
      {
        _id: slotDoc!._id,
        'slots.start': slotStartTime,
        'slots.end': slotEndTime,
        'slots.booked': false,
      },
      {
        $set: { 'slots.$.booked': true },
      },
      { new: true }
    );

    if (!updatedSlot) {
      throw new Error('Slot already booked');
    }

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
      patientDetails,
    });

    return await appointment.save();
  }

  async getAppointments(
    page: number,
    limit: number,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;
    const andConditions: Record<string, unknown>[] = [];

    console.log(dateRange);

    if (search) {
      andConditions.push({
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'doctor.name': { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (dateRange) {
      const { start, end } = getDateRange(dateRange);

      if (start && end) {
        andConditions.push({
          slotDate: { $gte: start, $lte: end },
        });
      }
    }

    const matchStage = andConditions.length > 0 ? { $and: andConditions } : {};

    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          userIdObj: { $toObjectId: '$userId' },
          docIdObj: { $toObjectId: '$docId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObj',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'doctors',
          localField: 'docIdObj',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await appointmentModel.aggregate(pipeline);

    const totalCountAgg = await appointmentModel.aggregate([
      {
        $addFields: {
          userIdObj: { $toObjectId: '$userId' },
          docIdObj: { $toObjectId: '$docId' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObj',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'doctors',
          localField: 'docIdObj',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      { $match: matchStage },
      { $count: 'total' },
    ]);

    const totalCount = totalCountAgg[0]?.total || 0;
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

  async findAppointmentById(appointmentId: string): Promise<AppointmentDocument | null> {
    return await appointmentModel.findById(appointmentId).lean();
  }

  async findUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filterType?: 'all' | 'upcoming' | 'ended'
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;

    const filter: any = { userId };

    if (filterType === 'upcoming' || filterType === 'ended') {
      filter.cancelled = { $ne: true };
    }

    const now = dayjs();

    if (filterType === 'upcoming') {
      filter.$or = [
        { slotDate: { $gt: now.format('YYYY-MM-DD') } },
        {
          slotDate: now.format('YYYY-MM-DD'),
          slotStartTime: { $gt: now.format('HH:mm') },
        },
      ];
    }

    if (filterType === 'ended') {
      filter.$or = [
        { slotDate: { $lt: now.format('YYYY-MM-DD') } },
        {
          slotDate: now.format('YYYY-MM-DD'),
          slotEndTime: { $lt: now.format('HH:mm') },
        },
      ];
    }

    const totalCount = await appointmentModel.countDocuments(filter);

    const data = await appointmentModel
      .find(filter)
      .populate('userId', 'name email image dob')
      .populate('docId', 'name image speciality')
      .sort({ createdAt: -1 })
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

  async findActiveUserAppointment(userId: string): Promise<AppointmentDocument | null> {
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

  async findAppointmentsByDoctorId(docId: string): Promise<AppointmentDocument[]> {
    return appointmentModel.find({ docId });
  }

  async confirmAppointment(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { isConfirmed: true });
  }

  async findDoctorAppointments(
    docId: string,
    page: number,
    limit: number,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;

    const query: FilterQuery<AppointmentDocument> = { docId };

    if (search) {
      query.$or = [
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (dateRange) {
      const { start, end } = getDateRange(dateRange);

      if (start && end) {
        query.slotDate = {
          $gte: dayjs(start).format('YYYY-MM-DD'),
          $lte: dayjs(end).format('YYYY-MM-DD'),
        };
      }
    }

    const totalCount = await appointmentModel.countDocuments(query);
    const data = await appointmentModel
      .find(query)
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

  async findActiveDoctorAppointment(docId: string): Promise<AppointmentDocument | null> {
    const now = new Date();

    const appointments = await appointmentModel.find({
      docId,
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

  async findAppointmentsOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);

    const match: any = { docId: String(doctorId), payment: true, cancelled: false };
    if (startDate || endDate) match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const res = await appointmentModel.aggregate(pipeline).exec();
    return res.map((r) => ({ date: r._id, count: r.count }));
  }

  async getAllAppointments(): Promise<AppointmentDocument[]> {
    return appointmentModel.find({});
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    // if (!appointment) throw new Error('Appointment not found');

    // if (appointment.userId.toString() !== userId.toString()) {
    //   throw new Error('Unauthorized action');
    // }

    // if (appointment.cancelled) {
    //   throw new Error('Appointment already cancelled');
    // }
    if (appointment) {
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
  }

  async getAppointmentsOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);

    const match: any = { docId: String(doctorId), payment: true, cancelled: false };
    if (startDate || endDate) match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const res = await appointmentModel.aggregate(pipeline).exec();
    return res.map((r) => ({ date: r._id, count: r.count }));
  }

  async getAppointmentsStats(
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);

    const match: Record<string, unknown> = { payment: true, cancelled: false };
    if (startDate || endDate) match.createdAt = {};
    if (startDate) (match.createdAt as Record<string, Date>).$gte = startDate;
    if (endDate) (match.createdAt as Record<string, Date>).$lte = endDate;

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const res = await appointmentModel.aggregate(pipeline).exec();
    return res.map((r) => ({ date: r._id, count: r.count }));
  }

  private _parseRange(start?: string, end?: string) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (start) startDate = new Date(start);
    if (end) {
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    }
    return { startDate, endDate };
  }

  async findStaleAppointments(): Promise<AppointmentDocument[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await appointmentModel.find({
      payment: true,
      isConfirmed: false,
      cancelled: false,
      createdAt: { $lt: twentyFourHoursAgo },
    });
  }
}
