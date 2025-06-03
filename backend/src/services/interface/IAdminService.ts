import { DoctorData, DoctorDTO } from "../../types/doctor";

export interface DoctorInput extends DoctorData {
    imageFile?: Express.Multer.File;
}


export interface IAdminService {
    login(email: string, password: string): Promise<string | null>;
    addDoctor(data: DoctorDTO): Promise<string>;
    getDoctors(): Promise<any[]>;
    getUsers(): Promise<any[]>;
    toggleUserBlock(userId: string): Promise<string>;

}