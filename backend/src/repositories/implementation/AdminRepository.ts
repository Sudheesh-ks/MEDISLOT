import { BaseRepository } from '../BaseRepository';
import adminModel, { AdminDocument } from '../../models/AdminModel';
import { IAdminRepository } from '../interface/IAdminRepository';

export class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor() {
    super(adminModel);
  }

  async findByEmail(email: string): Promise<AdminDocument | null> {
    return this.findOne({ email });
  }

  async findAdminById(id: string): Promise<AdminDocument | null> {
    return this.findById(id);
  }
}
