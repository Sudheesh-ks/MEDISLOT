import { DoctorData } from "../../types/doctor";
import { Request } from "express";

export interface DoctorInput extends DoctorData {
    imageFile?: Express.Multer.File;
}


export interface IAdminService {
    login(email: string, password: string): Promise<string | null>;
    addDoctor(req: Request): Promise<string>;
    getDoctors(): Promise<any[]>;
    getUsers(): Promise<any[]>;
    toggleUserBlock(userId: string): Promise<string>;

}