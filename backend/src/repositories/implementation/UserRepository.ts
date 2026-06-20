import { IUserRepository } from '../../repositories/interface/IUserRepository';
import userModel, { userDocument } from '../../models/UserModel';
import { BaseRepository } from '../BaseRepository';
import { userTypes } from '../../types/User';
import { PaginationResult } from '../../types/Pagination';
import { FilterQuery } from 'mongoose';

export class UserRepository extends BaseRepository<userDocument> implements IUserRepository {
  constructor() {
    super(userModel);
  }

  async createUser(user: Partial<userDocument>): Promise<userDocument> {
    const createdUser = await this.create(user);
    return createdUser as userDocument;
  }

  async findUserById(id: string): Promise<userDocument | null> {
    const user = await this.findById(id);
    return user ? (user as userDocument) : null;
  }

  async findUserByEmail(email: string): Promise<userDocument | null> {
    return this.findOne({ email });
  }

  async updateUserById(id: string, data: Partial<userTypes>): Promise<void> {
    await userModel.findByIdAndUpdate(id, { $set: data });
  }

  async updatePasswordByEmail(email: string, newHashedPassword: string): Promise<boolean> {
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { $set: { password: newHashedPassword } }
    );
    return !!updatedUser;
  }

  async getAllUsers(): Promise<userDocument[]> {
    return userModel.find({}).select('-password');
  }

  async getUsersPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginationResult<userDocument>> {
    const skip = (page - 1) * limit;

    const query: FilterQuery<userDocument> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const totalCount = await userModel.countDocuments(query);
    const data = await userModel.find(query).select('-password').skip(skip).limit(limit);

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

  async toggleUserBlock(userId: string, isBlocked: boolean): Promise<userDocument | null> {
    return userModel.findByIdAndUpdate(userId, { $set: { isBlocked } }, { new: true });
  }
}
