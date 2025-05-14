import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminController } from "../interface/adminController.interface";
import { CustomRequest } from "../../types/customRequest";



export class AdminController implements IAdminController {
    constructor(private adminService: IAdminService) {}

    async loginAdmin(req: Request, res: Response): Promise<void> {
        try {
            const token = await this.adminService.login(req.body.email, req.body.password);

            if (token) {
                res.json({ success: true, token });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addDoctor(req: CustomRequest, res: Response): Promise<void> {
        try {
            const message = await this.adminService.addDoctor(req);
            res.json({ success: true, message });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async allDoctors(req: Request, res: Response): Promise<void> {
        try {
            const doctors = await this.adminService.getDoctors();
            res.json({ success: true, doctors });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}