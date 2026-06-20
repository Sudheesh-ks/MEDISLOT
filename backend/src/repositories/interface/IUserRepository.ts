import { userTypes } from '../../types/User';
import { userDocument } from '../../models/UserModel';
import { PaginationResult } from '../../types/Pagination';

export interface IUserRepository {
  createUser(user: Partial<userDocument>): Promise<userDocument>;
  findUserByEmail(email: string): Promise<userDocument | null>;
  findUserById(id: string): Promise<userDocument | null>;
  updateUserById(id: string, data: Partial<userTypes>): Promise<void>;
  updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean>;
  getAllUsers(): Promise<userDocument[]>;
  getUsersPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginationResult<userDocument>>;
  toggleUserBlock(userId: string, isBlocked: boolean): Promise<userDocument | null>;
}
