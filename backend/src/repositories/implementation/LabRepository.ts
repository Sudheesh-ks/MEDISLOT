import { ILabRepository } from '../interface/ILabRepository';
import labModel, { LabDocument } from '../../models/labModel';
import { BaseRepository } from '../BaseRepository';
import { LabTypes } from '../../types/lab';
import { PaginationResult } from '../../types/pagination';

export class LabRepository extends BaseRepository<LabDocument> implements ILabRepository {
  constructor() {
    super(labModel);
  }

  async registerLab(data: LabTypes): Promise<LabDocument> {
    return this.create(data);
  }

  async findByEmail(email: string): Promise<LabDocument | null> {
    return this.findOne({ email });
  }

  async getLabsPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<PaginationResult<LabDocument>> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const totalCount = await labModel.countDocuments(filter);
    const data = await labModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
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

  async updateLabById(id: string, data: Partial<LabTypes>): Promise<void> {
    await labModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  async findNearbyLabs(
    longitude: number,
    latitude: number,
    maxDistance: number = 50000,
    search?: string,
    homeCollection?: boolean,
    accreditation?: string
  ): Promise<LabDocument[]> {
    const filter: any = {
      status: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (homeCollection !== undefined) {
      filter.homeCollection = homeCollection;
    }

    if (accreditation) {
      filter.accreditation = accreditation;
    }

    return labModel.find(filter).exec();
  }

  async updateRating(id: string, avgRating: number, ratingCount: number): Promise<void> {
    await labModel.findByIdAndUpdate(id, {
      $set: { averageRating: avgRating, ratingCount },
    }).exec();
  }
}
