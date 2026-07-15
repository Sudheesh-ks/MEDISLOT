import { BaseRepository } from '../BaseRepository';
import doctorModel, { DoctorDocument } from '../../models/DoctorModel';
import { DoctorTypes } from '../../types/Doctor';
import { IDoctorRepository } from '../interface/IDoctorRepository';
import { PaginationResult } from '../../types/Pagination';
import { FilterQuery, SortOrder } from 'mongoose';

export class DoctorRepository extends BaseRepository<DoctorDocument> implements IDoctorRepository {
  constructor() {
    super(doctorModel);
  }

  async registerDoctor(data: DoctorTypes): Promise<DoctorDocument> {
    return doctorModel.create(data);
  }

  async findDoctorByEmail(email: string): Promise<DoctorDocument | null> {
    return this.findOne({ email });
  }

  async saveDoctorData(doctor: DoctorDocument): Promise<void> {
    await doctor.save();
  }

  async updateAvailability(id: string, available: boolean): Promise<void> {
    await this.updateById(id, { available });
  }

  async getAllDoctors(): Promise<DoctorDocument[]> {
    return doctorModel.find({}).select('-password');
  }

  async getDoctorsPaginated(
    page: number,
    limit: number,
    search?: string,
    speciality?: string,
    minRating?: number,
    sortOrder?: string,
    status: string | null = 'approved'
  ): Promise<PaginationResult<DoctorDocument>> {
    const skip = (page - 1) * limit;

    const query: FilterQuery<DoctorDocument> = {};
    if (status !== null) {
      query.status = status;
    }

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

  async getLatestDoctorRequests(limit: number): Promise<DoctorDocument[]> {
    const docs = await doctorModel.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(limit);

    return docs as unknown as DoctorDocument[];
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

  async updateDoctorRating(
    doctorId: string,
    averageRating: number,
    ratingCount: number
  ): Promise<void> {
    await doctorModel.findByIdAndUpdate(doctorId, {
      averageRating,
      ratingCount,
    });
  }
}
