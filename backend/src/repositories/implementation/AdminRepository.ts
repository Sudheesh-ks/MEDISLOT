import { IAdminRepository } from "../interface/IAdminRepository";
import doctorModel from "../../models/doctorModel";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";
import userModel from "../../models/userModel";


export class AdminRepository implements IAdminRepository {
    async saveDoctor(data: DoctorData): Promise<void> {
        const newDoctor = new doctorModel(data);
        await newDoctor.save();
    }

    async getAllDoctors(): Promise<Omit<DoctorData, 'password'>[]> {
        return await doctorModel.find({}).select('-password');
    }

    async getAllUsers(): Promise<Omit<userData, 'password'>[]> {
        return await userModel.find({}).select('-password');
    }

    async toggleUserBlock(userId: string): Promise<string> {
        const user = await userModel.findById(userId);
        if(!user) throw new Error("User not found");

        user.isBlocked = !user.isBlocked;
        await user.save();

        return user.isBlocked ? "User blocked" : "User unblocked";
    }
}