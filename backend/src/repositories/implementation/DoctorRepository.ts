import { BaseRepository } from '../BaseRepository';
import appointmentModel from '../../models/AppointmentModel';
import doctorModel, { DoctorDocument } from '../../models/DoctorModel';
import { DoctorTypes } from '../../types/Doctor';
import { IDoctorRepository } from '../interface/IDoctorRepository';
import { PaginationResult } from '../../types/Pagination';
import { FilterQuery, PipelineStage, SortOrder } from 'mongoose';

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

  async findDoctorById(id: string): Promise<DoctorDocument | null> {
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

  async updateDoctorRating(doctorId: string, rating: number): Promise<void> {
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) throw new Error('Doctor not found');

    const currentCount = doctor.ratingCount ?? 0;
    const currentAverage = doctor.averageRating ?? 0;

    doctor.ratingCount = currentCount + 1;

    doctor.averageRating = (currentAverage * currentCount + rating) / doctor.ratingCount;

    await doctor.save();
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

    const res = await appointmentModel.aggregate(pipeline).exec();
    console.log(res);
    return res.map((r) => ({ date: r._id, revenue: r.revenue }));
  }
}
