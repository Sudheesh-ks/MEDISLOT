import dayjs from 'dayjs';
import appointmentModel, { AppointmentDocument } from '../../models/AppointmentModel';
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

  async createAppointment(
    appointmentData: AppointmentTypes,
    session?: any
  ): Promise<AppointmentDocument> {
    const appointment = new appointmentModel(appointmentData);

    return await appointment.save({ session });
  }

  async getAppointments(
    page: number,
    limit: number,
    search?: string,
    dateRange?: string
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;
    const andConditions: Record<string, unknown>[] = [];

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

  async findPayableAppointment(appointmentId: string): Promise<AppointmentDocument> {
    const appointment = await appointmentModel.findById(appointmentId);
    return appointment as AppointmentDocument;
  }

  async saveRazorpayOrderId(appointmentId: string, orderId: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      razorpayOrderId: orderId,
    });
  }

  async markAppointmentPaid(appointmentId: string, session?: any): Promise<void> {
    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true }, { session });
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

  async cancelAppointment(appointmentId: string, session?: any): Promise<void> {
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true }, { session });
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

  async findUpcomingAppointmentsByDoctorId(
    doctorId: string,
    fromDate: string
  ): Promise<AppointmentDocument[]> {
    return await appointmentModel.find({
      docId: doctorId,
      slotDate: { $gte: fromDate },
      cancelled: false,
    });
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

  async getDoctorRevenueFromAppointments(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]> {
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
          revenue: { $sum: { $multiply: [{ $ifNull: ['$amount', 0] }, 0.8] } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const res = await appointmentModel.aggregate(pipeline).exec();
    return res.map((r) => ({ date: r._id, revenue: r.revenue }));
  }

  async getTopDoctorsByAppointments(
    limit: number
  ): Promise<{ doctorId: string; doctorName: string; appointments: number; revenue: number }[]> {
    const pipeline: PipelineStage[] = [
      {
        $addFields: {
          docIdObj: { $toObjectId: '$docId' },
        },
      },
      {
        $group: {
          _id: '$docIdObj',
          appointments: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
      { $sort: { appointments: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          doctorId: '$_id',
          doctorName: '$doctor.name',
          appointments: 1,
          revenue: 1,
        },
      },
    ];

    return await appointmentModel.aggregate(pipeline).exec();
  }

  async getAdminRevenueFromAppointments(
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);
    const match: any = { payment: true, cancelled: false };
    if (startDate || endDate) match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: { $multiply: [{ $ifNull: ['$amount', 0] }, 0.2] } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const res = await appointmentModel.aggregate(pipeline).exec();
    return res.map((r) => ({ date: r._id, revenue: r.revenue }));
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
}
