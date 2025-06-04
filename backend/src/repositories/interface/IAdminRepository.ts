import { adminData } from "../../types/admin";
import { DoctorData } from "../../types/doctor";
import { userData } from "../../types/user";


export interface IAdminRepository {
    findByEmail(email: string): Promise<adminData | null>
    saveDoctor(data: DoctorData): Promise<void>;
    getAllDoctors(): Promise<Omit<DoctorData, 'password'>[]>;
    getAllUsers(): Promise<Omit<userData, 'password'>[]>;
    toggleUserBlock(userId: string): Promise<string>;
}