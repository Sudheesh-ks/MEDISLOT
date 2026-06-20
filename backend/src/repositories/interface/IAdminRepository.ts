import { AdminDocument } from '../../models/AdminModel';

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDocument | null>;
  findAdminById(id: string): Promise<AdminDocument | null>;
}
