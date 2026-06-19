import { IUserRepository } from '../../repositories/interface/IUserRepository';
import userModel, { userDocument } from '../../models/UserModel';
import { BaseRepository } from '../BaseRepository';
import { userTypes } from '../../types/User';

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
}
