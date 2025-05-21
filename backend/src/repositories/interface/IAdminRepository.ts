import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";


export interface IAdminRepository {
    saveDoctor(data: DoctorData): Promise<void>;
    getAllDoctors(): Promise<Omit<DoctorData, 'password'>[]>;
    getAllUsers(): Promise<Omit<userData, 'password'>[]>;
    toggleUserBlock(userId: string): Promise<string>;
}