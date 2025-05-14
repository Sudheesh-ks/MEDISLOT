import { Request } from "express";


export interface IAdminService {
    login(email: string, password: string): Promise<string | null>;
    addDoctor(req: Request): Promise<string>;
    getDoctors(): Promise<any[]>;
}