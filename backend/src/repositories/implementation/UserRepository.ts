import { userDataRepository, UserDocument } from '../../repositories/interface/IUserRepository'
import userModel from "../../models/userModel";
import { userData } from "../../types/user";




export class UserRepository implements userDataRepository {
    async create(user: Partial<userData>): Promise<UserDocument> {
        return await new userModel(user).save() as UserDocument;
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return await userModel.findOne({ email }) as UserDocument | null;
    }

    async findById(id: string): Promise<UserDocument | null> {
        return await userModel.findById(id).select("-password") as UserDocument | null;
    }

    async updateById(id: string, data: Partial<userData>): Promise<void> {
        await userModel.findByIdAndUpdate(id, data);
    }
}