import { LabServiceDocument } from '../../models/labServiceModel';
import { LabServiceTypes } from '../../types/lab';

export interface ILabServiceRepository {
  createService(data: Partial<LabServiceTypes>): Promise<LabServiceDocument>;
  findById(id: string): Promise<LabServiceDocument | null>;
  updateService(id: string, data: Partial<LabServiceTypes>): Promise<void>;
  deleteService(id: string): Promise<void>;
  findByLabId(labId: string, activeOnly?: boolean): Promise<LabServiceDocument[]>;
  searchServices(
    query?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    homeCollection?: boolean
  ): Promise<LabServiceDocument[]>;
  findAllCategories(): Promise<string[]>;
}
