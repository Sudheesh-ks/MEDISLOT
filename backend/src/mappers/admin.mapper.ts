import { AdminDTO } from '../dtos/Admin.dto';
import { AdminDocument } from '../models/AdminModel';

export const toAdminDTO = (admin: AdminDocument): AdminDTO => {
  return {
    _id: admin._id.toString(),
    email: admin.email,
  };
};
