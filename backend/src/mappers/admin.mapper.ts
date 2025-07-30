import { AdminDTO } from "../dtos/admin.dto";
import { AdminDocument } from "../models/adminModel";

export const toAdminDTO = (admin: AdminDocument): AdminDTO => {
  return {
    _id: admin._id.toString(),
    email: admin.email,
  };
};
