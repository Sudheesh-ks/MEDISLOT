import { IAdminRepository } from "../../repositories/interface/IAdminRepository";
import { IAdminService } from "../interface/IAdminService";
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt  from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { DoctorData } from "../../types/doctor";
import dotenv from 'dotenv';
import userModel from "../../models/userModel";
dotenv.config()



export class AdminService implements IAdminService {
    constructor(private readonly adminRepository: IAdminRepository) {}

    async login(email: string, password: string): Promise<string | null> {
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            return jwt.sign(email + password, process.env.JWT_SECRET!);
        }
        return null;
    }

    async addDoctor(req: Request): Promise<string> {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = (req as any).file;

        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            throw new Error('Missing Details');
        }

        if(!validator.isEmail(email)){
            throw new Error('Invalid Email');
        }

        if(password.length < 8){
            throw new Error('Password must be at least 8 characters');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let imageUrl = '';
        if(imageFile){
            const uploadResult = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
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
            address: JSON.parse(address),
            date: new Date()
        }

        await this.adminRepository.saveDoctor(doctorData);
        return 'Doctor added successfully';
    }

    async getDoctors(): Promise<any[]> {
        return await this.adminRepository.getAllDoctors();
    }

    async getAllUsers(): Promise<any> {
    return await userModel.find({}, { password: 0 }); // exclude password
}

async toggleUserBlock(userId: string): Promise<string> {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user.isBlocked ? "User blocked" : "User unblocked";
}

}
