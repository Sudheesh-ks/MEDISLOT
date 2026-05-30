import { ILabBookingRepository } from '../interface/ILabBookingRepository';
import labBookingModel, { LabBookingDocument } from '../../models/labBookingModel';
import { BaseRepository } from '../BaseRepository';
import { LabBookingTypes } from '../../types/lab';
import { PaginationResult } from '../../types/pagination';

export class LabBookingRepository extends BaseRepository<LabBookingDocument> implements ILabBookingRepository {
  constructor() {
    super(labBookingModel);
  }

  async createBooking(data: Partial<LabBookingTypes>): Promise<LabBookingDocument> {
    return this.create(data);
  }

  async findByBookingId(bookingId: string): Promise<LabBookingDocument | null> {
    return labBookingModel
      .findOne({ bookingId })
      .populate('userId', '-password')
      .populate('labId', '-password')
      .populate('services')
      .populate('technicianId')
      .exec();
  }

  async findByRazorpayOrderId(orderId: string): Promise<LabBookingDocument | null> {
    return labBookingModel.findOne({ razorpayOrderId: orderId }).exec();
  }

  async updateBookingById(id: string, data: Partial<LabBookingTypes>): Promise<void> {
    await labBookingModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  async getBookingsByUserId(userId: string): Promise<LabBookingDocument[]> {
    return labBookingModel
      .find({ userId })
      .populate('labId', '-password')
      .populate('services')
      .populate('technicianId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getBookingsByLabIdPaginated(
    labId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
    dateRange?: string
  ): Promise<PaginationResult<LabBookingDocument>> {
    const skip = (page - 1) * limit;
    const filter: any = { labId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (dateRange && dateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateRange === 'today') {
        const yyyymmdd = today.toISOString().split('T')[0];
        filter.bookingDate = yyyymmdd;
      }
    }

    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { paymentStatus: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await labBookingModel.countDocuments(filter);
    const data = await labBookingModel
      .find(filter)
      .populate('userId', 'name email phone')
      .populate('services')
      .populate('technicianId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

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

  async getAllBookingsPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    dateRange?: string
  ): Promise<PaginationResult<LabBookingDocument>> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { paymentStatus: { $regex: search, $options: 'i' } },
      ];
    }

    const totalCount = await labBookingModel.countDocuments(filter);
    const data = await labBookingModel
      .find(filter)
      .populate('userId', 'name email')
      .populate('labId', 'name')
      .populate('services')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

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

  async getRevenueOverTime(
    labId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]> {
    const query: any = { labId, paymentStatus: 'paid' };
    if (start && end) {
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const bookings = await labBookingModel.find(query).exec();
    const map = new Map<string, number>();

    bookings.forEach((b) => {
      const day = b.createdAt ? b.createdAt.toISOString().split('T')[0] : '';
      if (day) {
        map.set(day, (map.get(day) || 0) + b.finalAmount);
      }
    });

    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getBookingsOverTime(
    labId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]> {
    const query: any = { labId };
    if (start && end) {
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const bookings = await labBookingModel.find(query).exec();
    const map = new Map<string, number>();

    bookings.forEach((b) => {
      const day = b.createdAt ? b.createdAt.toISOString().split('T')[0] : '';
      if (day) {
        map.set(day, (map.get(day) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
