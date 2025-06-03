import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { DoctorData, DoctorDTO } from "../../types/doctor";
import { isValidName, isValidEmail, isValidPassword } from "../../utils/validator";
import dotenv from 'dotenv';
dotenv.config()



export class AdminService implements IAdminService {
    constructor(private readonly adminRepository: IAdminRepository) { }

    async login(email: string, password: string): Promise<string | null> {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return jwt.sign(email + password, process.env.JWT_SECRET!);
        }
        return null;
    }

    async addDoctor(data: DoctorDTO): Promise<string> {
        const { name, email, password, speciality, degree, experience, about, fees, address, imagePath } = data;


        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            throw new Error('All Fields Required');
        }

        if (!isValidName(name)) {
            throw new Error('Name must only contain atleast 4 characters');
        }

        if (!isValidEmail(email)) {
            throw new Error('Invalid Email');
        }

        if (!isValidPassword(password)) {
            throw new Error('Password must be at least 8 characters long, contain at least 1 letter, 1 number, and 1 special character');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let imageUrl = '';
        if (imagePath) {
            const uploadResult = await cloudinary.uploader.upload(imagePath, { resource_type: "image" });
            imageUrl = uploadResult.secure_url;
        }

        const doctorData: DoctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address,
            date: new Date()
        }

        await this.adminRepository.saveDoctor(doctorData);
        return 'Doctor added successfully';
    }

    async getDoctors(): Promise<any[]> {
        return await this.adminRepository.getAllDoctors();
    }

    async getUsers(): Promise<any[]> {
        return await this.adminRepository.getAllUsers();
    }

    async toggleUserBlock(userId: string): Promise<string> {
        return await this.adminRepository.toggleUserBlock(userId);
    }

}
