import { ILabServiceRepository } from '../interface/ILabServiceRepository';
import labServiceModel, { LabServiceDocument } from '../../models/labServiceModel';
import { BaseRepository } from '../BaseRepository';
import { LabServiceTypes } from '../../types/lab';

export class LabServiceRepository extends BaseRepository<LabServiceDocument> implements ILabServiceRepository {
  constructor() {
    super(labServiceModel);
  }

  async createService(data: Partial<LabServiceTypes>): Promise<LabServiceDocument> {
    return this.create(data);
  }

  async updateService(id: string, data: Partial<LabServiceTypes>): Promise<void> {
    await labServiceModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  async deleteService(id: string): Promise<void> {
    await this.deleteById(id);
  }

  async findByLabId(labId: string, activeOnly: boolean = false): Promise<LabServiceDocument[]> {
    const query: any = { labId };
    if (activeOnly) {
      query.isActive = true;
    }
    return labServiceModel.find(query).exec();
  }

  async searchServices(
    query?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    homeCollection?: boolean
  ): Promise<LabServiceDocument[]> {
    const filter: any = { isActive: true };

    if (query) {
      filter.$or = [
        { testName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (homeCollection !== undefined) {
      filter.homeCollection = homeCollection;
    }

    return labServiceModel.find(filter).populate('labId').exec();
  }

  async findAllCategories(): Promise<string[]> {
    return labServiceModel.distinct('category').exec();
  }
}
