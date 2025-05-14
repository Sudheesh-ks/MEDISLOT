import { IAdminRepository } from "../interface/IAdminRepository";
import doctorModel from "../../models/doctorModel";
import { DoctorData } from "../../types/doctor";


export class AdminRepository implements IAdminRepository {
    async saveDoctor(data: DoctorData): Promise<void> {
        const newDoctor = new doctorModel(data);
        await newDoctor.save();
    }

    async getAllDoctors(): Promise<Omit<DoctorData, 'password'>[]> {
        return await doctorModel.find({}).select('-password');
    }
}