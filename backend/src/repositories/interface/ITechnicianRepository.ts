import { TechnicianDocument } from '../../models/technicianModel';
import { TechnicianTypes } from '../../types/lab';

export interface ITechnicianRepository {
  createTechnician(data: Partial<TechnicianTypes>): Promise<TechnicianDocument>;
  findById(id: string): Promise<TechnicianDocument | null>;
  findByLabId(labId: string): Promise<TechnicianDocument[]>;
  updateTechnician(id: string, data: Partial<TechnicianTypes>): Promise<void>;
  deleteTechnician(id: string): Promise<void>;
}
