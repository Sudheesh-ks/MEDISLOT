import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminController } from "../interface/adminController.interface";
import { CustomRequest } from "../../types/customRequest";
import { HttpStatus } from "../../constants/status.constants";
import { DoctorDTO } from "../../types/doctor";



export class AdminController implements IAdminController {
    constructor(private adminService: IAdminService) { }

    // For Admin login
    async loginAdmin(req: Request, res: Response): Promise<void> {
        try {
            const token = await this.adminService.login(req.body.email, req.body.password);

            if (token) {
                res.status(HttpStatus.OK).json({ success: true, token });
            } else {
                res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }

    // To add doctor
    async addDoctor(req: CustomRequest, res: Response): Promise<void> {
        try {

            const {
                name, email, password, speciality, degree,
                experience, about, fees, address
            } = req.body;

            const imageFile = req.file;

            const doctorDTO: DoctorDTO = {
                name,
                email,
                password,
                speciality,
                degree,
                experience,
                about,
                fees: Number(fees),
                address: JSON.parse(address),
                imagePath: imageFile?.path
            };
            const message = await this.adminService.addDoctor(doctorDTO);
            res.status(HttpStatus.CREATED).json({ success: true, message });
            return;
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
        }
    }

    // To get all the doctors
    async allDoctors(req: Request, res: Response): Promise<void> {
        try {
            const doctors = await this.adminService.getDoctors();
            res.status(HttpStatus.OK).json({ success: true, doctors });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }

    // To get all users 
    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.adminService.getUsers();
            res.status(HttpStatus.OK).json({ success: true, users });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    }

    // To toggle the state of user
    async toggleUserBlock(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            const message = await this.adminService.toggleUserBlock(userId);
            res.status(HttpStatus.OK).json({ success: true, message });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
        }
    }

}