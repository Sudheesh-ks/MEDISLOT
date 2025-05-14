import { userData } from "../../types/user";

export interface userDataService {
    register(name: string, email: string, password: string): Promise<{ token: string }>;
    login(email: string, password: string): Promise<{ token: string }>;
    getProfile(userId: string): Promise<userData | null>;
    updateProfile(userId: string, data: Partial<userData>, imageFile?: Express.Multer.File): Promise<void>;
}