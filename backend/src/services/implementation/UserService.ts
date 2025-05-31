import { userDataService } from "../interface/IUserService";
import { userDataRepository } from "../../repositories/interface/IUserRepository";
import { userData } from "../../types/user";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import { AppointmentTypes } from "../../types/appointment";

export interface UserDocument extends userData {
    _id: string;
}


export class UserService implements userDataService {
    constructor(private userRepository: userDataRepository) { }

    async register(name: string, email: string, password: string): Promise<{ token: string }> {
        if (!name || !email || !password) throw new Error("Missing Details");
        if (!validator.isEmail(email)) throw new Error("Invalid email");
        if (password.length < 8) throw new Error("Password too short");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userRepository.create({ name, email, password: hashedPassword }) as UserDocument;
        const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
        return { token };
    }

    async login(email: string, password: string): Promise<{ token: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new Error("User not found");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");
        if (user.isBlocked) throw new Error("Your account has been blocked");

        const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
        return { token };
    }

    async getProfile(userId: string): Promise<userData | null> {
        return await this.userRepository.findById(userId);
    }

    async updateProfile(userId: string, data: Partial<userData>, imageFile?: Express.Multer.File): Promise<void> {
        if (!data.name || !data.phone || !data.address || !data.dob || !data.gender) {
            throw new Error("Data missing");
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            data.image = imageUpload.secure_url;
        }

        await this.userRepository.updateById(userId, data);
    }

    async checkEmailExists(email: string): Promise<boolean> {
        const user = await this.userRepository.findByEmail(email);
        return !!user
    }

    async hashPassword(password: string) {
        return await bcrypt.hash(password, 10);
    }

    async finalizeRegister(userData: userData) {
        return await this.userRepository.create(userData);
    }

    generateToken(userId: string): string {
        return Jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    }

    async resetPassword(email: string, newHashedPassword: string): Promise<boolean> {
        return await this.userRepository.updatePasswordByEmail(email, newHashedPassword);
    }

    async bookAppointment(appointmentData: AppointmentTypes): Promise<void> {
        await this.userRepository.bookAppointment(appointmentData);
    }

}