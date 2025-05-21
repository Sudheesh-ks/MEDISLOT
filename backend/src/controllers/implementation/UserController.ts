import { Request, Response } from "express";
import { userDataService } from "../../services/interface/IUserService";
import { HttpStatus } from "../../constants/status.constants";
import { IUserController } from "../interface/userController.interface";
import { otpStore } from "../../utils/otpStore";
import { sendOTP } from "../../utils/mail.util";
import { generateOTP } from "../../utils/otp.util";


export class UserController implements IUserController {
    constructor(private userService: userDataService) { }

    // For registering new user
    async registerUser(req: Request, res: Response): Promise<void> {
        const { name, email, password } = req.body;

        const existing = await this.userService.checkEmailExists(email);
        if (existing) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }

        const hashed = await this.userService.hashPassword(password);
        const otp = generateOTP();
        console.log(otp)

        otpStore.set(email, { otp, purpose: 'register', userData: { name, email, password: hashed } });

        try {

            await sendOTP(email, otp);
            res.status(200).json({ success: true, message: 'OTP sent to email' });

        } catch (err) {
            console.error('Email send failed:', err);
            res.status(500).json({ success: false, message: 'OTP sent failed' })
        }
    }


    // For OTP verification
    async verifyOtp(req: Request, res: Response): Promise<void> {
        const { email, otp } = req.body;

        const record = otpStore.get(email);
        if (!record || record.otp !== otp) {
            res.status(401).json({ success: false, message: 'Invalid OTP' });
            return;
        }

        if(record.purpose === 'register'){
            const newUser = await this.userService.finalizeRegister(record.userData);
            const token = this.userService.generateToken(newUser._id);
            otpStore.delete(email);
            res.status(201).json({ success: true, token, message: 'Registered Successfully' });
            return;
        }

        if(record.purpose === 'reset-password'){
            otpStore.set(email, {...record, otp: 'VERIFIED'});
            res.status(200).json({success: true, message: 'OTP verified'});
            return;
        }

        res.status(400).json({success: false, message: 'Unknown OTP purpose'})

    }


    // For resenting OTP
    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            const record = otpStore.get(email);

            if (!record) {
                res.status(404).json({ success: false, message: "No pending OTP found" });
                return;
            }

            const newOtp = generateOTP();
            console.log(newOtp)
            otpStore.set(email, { ...record, otp: newOtp });

            await sendOTP(email, newOtp);
            res.status(200).json({ success: true, message: "OTP resent successfully" });

        } catch (error) {
            console.error("Resend OTP error:", error);
            res.status(500).json({ success: false, message: "Failed to resend OTP" });
        }
    }


    // For forgot password request
    async forgotPasswordRequest(req: Request, res: Response): Promise<void> {
        const { email } = req.body;

        try {
            const user = await this.userService.checkEmailExists(email);
            if (!user) {
                res.status(404).json({ success: false, message: "Email not found" });
                return;
            }

            const otp = generateOTP();
            console.log(otp)
            otpStore.set(email, {otp, purpose: 'reset-password', email});

            await sendOTP(email, otp);
            res.status(200).json({ success: true, message: "OTP sent to your email" });
        } catch (err) {
            console.error("Error sending OTP:", err);
            res.status(500).json({ success: false, message: "Failed to send OTP" });
        }
    }


    // For reset password
    async resetPassword(req: Request, res: Response): Promise<void> {
        const { email, newPassword } = req.body;

        const record = otpStore.get(email);
        if (!record || record.purpose !== 'reset-password' || record.otp !== "VERIFIED") {
            res.status(401).json({ success: false, message: "OTP not verified or expired" });
            return;
        }

        const hashed = await this.userService.hashPassword(newPassword);
        const updated = await this.userService.resetPassword(email, hashed);

        if (!updated) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        otpStore.delete(email);

        res.status(200).json({ success: true, message: "Password updated successfully" });
    }


    // For user login
    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { token } = await this.userService.login(email, password);
            res.json({ success: true, token });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    
    // For getting user profile
    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            const userData = await this.userService.getProfile(userId);
            if (!userData) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.json({ success: true, userData });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }


    // For updating user profile
    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId;
            await this.userService.updateProfile(userId, req.body, req.file);
            res.json({ success: true, message: "Profile updated" });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

}