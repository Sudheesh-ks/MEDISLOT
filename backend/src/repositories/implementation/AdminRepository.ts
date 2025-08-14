import { BaseRepository } from '../BaseRepository';
import adminModel, { AdminDocument } from '../../models/adminModel';
import doctorModel, { DoctorDocument } from '../../models/doctorModel';
import userModel, { userDocument } from '../../models/userModel';
import appointmentModel, { AppointmentDocument } from '../../models/appointmentModel';
import { PipelineStage } from 'mongoose';
import { PaginationResult } from '../../types/pagination';
import { IAdminRepository } from '../interface/IAdminRepository';

export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor() {
    super(adminModel);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.findOne({ email });
  }

  async findAdminById(id: string): Promise<AdminDocument | null> {
    return this.findById(id);
  }

  async getAllDoctors(): Promise<DoctorDocument[]> {
    return doctorModel.find({}).select('-password');
  }

  async getDoctorsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<DoctorDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await doctorModel.countDocuments({});
    const data = await doctorModel.find({}).select('-password').skip(skip).limit(limit);

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
    return userModel.find({}).select('-password');
  }

  async getUsersPaginated(page: number, limit: number): Promise<PaginationResult<userDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await userModel.countDocuments({});
    const data = await userModel.find({}).select('-password').skip(skip).limit(limit);

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

  async toggleUserBlock(userId: string): Promise<userDocument> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error('User not found');

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user;
  }

  async getAllAppointments(): Promise<AppointmentDocument[]> {
    return appointmentModel.find({});
  }

  async getAppointmentById(id: string): Promise<AppointmentDocument | null> {
    return appointmentModel.findById(id);
  }

  async getAppointmentsPaginated(
    page: number,
    limit: number
  ): Promise<PaginationResult<AppointmentDocument>> {
    const skip = (page - 1) * limit;
    const totalCount = await appointmentModel.countDocuments({});
    const data = await appointmentModel
      .find({})
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

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.cancelled) {
      throw new Error('Appointment already cancelled');
    }

    appointment.cancelled = true;
    await appointment.save();

    const { docId, slotDate, slotStartTime } = appointment;
    const doctor = await doctorModel.findById(docId);
    if (doctor) {
      const slots = doctor.slots_booked || {};
      if (Array.isArray(slots[slotDate])) {
        slots[slotDate] = slots[slotDate].filter((t: string) => t !== slotStartTime);
        if (!slots[slotDate].length) delete slots[slotDate];
        doctor.slots_booked = slots;
        doctor.markModified('slots_booked');
        await doctor.save();
      }
    }
  }

  async getLatestDoctorRequests(limit = 5): Promise<DoctorDocument[]> {
    const docs = await doctorModel.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(limit);

    return docs as unknown as DoctorDocument[];
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

  async getAppointmentsStats(
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);

    const match: any = { payment: true, cancelled: false };
    if (startDate || endDate) match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;

    const pipeline: any[] = [
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
    return res.map((r: any) => ({ date: r._id, count: r.count }));
  }

  async getTopDoctors(
    limit = 5
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

  async getRevenueStats(
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
    return res.map((r: any) => ({ date: r._id, revenue: r.revenue }));
  }
}
