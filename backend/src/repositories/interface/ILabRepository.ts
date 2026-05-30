import { LabDocument } from '../../models/labModel';
import { LabTypes } from '../../types/lab';
import { PaginationResult } from '../../types/pagination';

export interface ILabRepository {
  registerLab(data: LabTypes): Promise<LabDocument>;
  findById(id: string): Promise<LabDocument | null>;
  findByEmail(email: string): Promise<LabDocument | null>;
  getLabsPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<PaginationResult<LabDocument>>;
  updateLabById(id: string, data: Partial<LabTypes>): Promise<void>;
  findNearbyLabs(
    longitude: number,
    latitude: number,
    maxDistance?: number,
    search?: string,
    homeCollection?: boolean,
    accreditation?: string
  ): Promise<LabDocument[]>;
  updateRating(id: string, avgRating: number, ratingCount: number): Promise<void>;
}
