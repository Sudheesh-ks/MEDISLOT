import { BaseRepository } from '../BaseRepository';
import appointmentModel, { AppointmentDocument } from '../../models/appointmentModel';
import doctorModel, { DoctorDocument } from '../../models/doctorModel';
import { DoctorTypes } from '../../types/doctor';
import { IDoctorRepository } from '../interface/IDoctorRepository';
import { PaginationResult } from '../../types/pagination';
import { FilterQuery, PipelineStage, SortOrder } from 'mongoose';
import slotModel from '../../models/slotModel';
import dayjs from 'dayjs';

export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
  constructor() {
    super(doctorModel);
  }

  async registerDoctor(data: DoctorTypes): Promise<DoctorDocument> {
    return doctorModel.create(data);
  }

  async findByEmail(email: string): Promise<DoctorDocument | null> {
    return this.findOne({ email });
  }

  async save(doctor: DoctorDocument): Promise<void> {
    await doctor.save();
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await this.updateById(id, { available });
  }

  async findAllDoctors(): Promise<DoctorDocument[]> {
    return doctorModel.find({}).select('-password');
  }

  async findAppointmentsByDoctorId(docId: string): Promise<AppointmentDocument[]> {
    return appointmentModel.find({ docId });
  }

  async findAppointmentById(id: string): Promise<AppointmentDocument | null> {
    return appointmentModel.findById(id);
  }

  async markAppointmentAsConfirmed(id: string): Promise<void> {
    await appointmentModel.findByIdAndUpdate(id, { isConfirmed: true });
  }

  async cancelAppointment(id: string): Promise<void> {
    const appointment = await appointmentModel.findById(id);
    if (!appointment) throw new Error('Appointment not found');

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

  async getDoctorsPaginated(
    page: number,
    limit: number,
    search?: string,
    speciality?: string,
    minRating?: number,
    sortOrder?: string
  ): Promise<PaginationResult<DoctorDocument>> {
    const skip = (page - 1) * limit;

    const query: FilterQuery<DoctorDocument> = { status: 'approved' };

    const sort: Record<string, SortOrder> = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (speciality) {
      query.speciality = speciality;
    }

    if (minRating) {
      query.averageRating = { $gte: minRating, $lt: minRating + 1 };
    }

    if (sortOrder === 'asc') {
      sort.averageRating = 1;
    } else {
      sort.averageRating = -1;
    }

    const totalCount = await doctorModel.countDocuments(query);
    const data = await doctorModel
      .find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort(sort);

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

  async getAppointmentsPaginated(
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
      const now = new Date();
      let start: Date | undefined;
      let end: Date | undefined;

      switch (dateRange) {
        case 'today': {
          start = dayjs().startOf('day').toDate();
          end = dayjs().endOf('day').toDate();
          break;
        }
        case 'yesterday': {
          start = dayjs().subtract(1, 'day').startOf('day').toDate();
          end = dayjs().subtract(1, 'day').endOf('day').toDate();
          break;
        }
        case 'last_week': {
          start = dayjs().subtract(7, 'day').startOf('day').toDate();
          end = now;
          break;
        }
        case 'last_month': {
          start = dayjs().subtract(1, 'month').startOf('day').toDate();
          end = now;
          break;
        }
        default: {
          const [from, to] = dateRange.split('_');
          if (from && to) {
            start = dayjs(from).startOf('day').toDate();
            end = dayjs(to).endOf('day').toDate();
          }
          break;
        }
      }

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

  async findActiveAppointment(docId: string): Promise<AppointmentDocument | null> {
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

  async getDoctorProfileById(id: string): Promise<DoctorDocument | null> {
    return doctorModel.findById(id).select('-password');
  }

  async updateDoctorById(id: string, data: Partial<DoctorTypes>): Promise<void> {
    await doctorModel.findByIdAndUpdate(id, { $set: data });
  }

  async updateDoctorProfile(
    id: string,
    updateData: Partial<
      Pick<
        DoctorTypes,
        | 'name'
        | 'speciality'
        | 'degree'
        | 'experience'
        | 'about'
        | 'fees'
        | 'address'
        | 'image'
        | 'available'
      >
    >
  ): Promise<void> {
    await this.updateById(id, updateData);
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

  async getRevenueOverTime(
    doctorId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]> {
    const { startDate, endDate } = this._parseRange(start, end);

    console.log(startDate);
    console.log(endDate);

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

    // console.log(pipeline)

    const res = await appointmentModel.aggregate(pipeline).exec();
    console.log(res);
    return res.map((r) => ({ date: r._id, revenue: r.revenue }));
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
}
