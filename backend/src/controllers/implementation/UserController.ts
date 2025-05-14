import { Request, Response } from "express";
import { userDataService } from "../../services/interface/IUserService";
import { HttpStatus } from "../../constants/status.constants";

export class UserController {
    constructor(private userService: userDataService) {}

    async registerUser(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            const { token } = await this.userService.register(name, email, password);
            res.json({ success: true, token });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { token } = await this.userService.login(email, password);
            res.json({ success: true, token });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async getProfile(req: Request, res: Response) {
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

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            await this.userService.updateProfile(userId, req.body, req.file);
            res.json({ success: true, message: "Profile updated" });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }
}