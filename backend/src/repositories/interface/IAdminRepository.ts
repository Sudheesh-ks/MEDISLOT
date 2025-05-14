import { DoctorData } from "../../types/doctor";


export interface IAdminRepository {
    saveDoctor(data: DoctorData): Promise<void>;
    getAllDoctors(): Promise<Omit<DoctorData, 'password'>[]>;
}