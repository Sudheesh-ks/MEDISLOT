import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminController } from "../interface/IadminController.interface";
import { CustomRequest } from "../../types/customRequest";
import { HttpStatus } from "../../constants/status.constants";
import { DoctorDTO } from "../../types/doctor";

export class AdminController implements IAdminController {
  constructor(private _adminService: IAdminService) {}

  // For Admin login
  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Email and password are required" });
        return;
      }

      const { token } = await this._adminService.login(email, password);
      res.status(HttpStatus.OK).json({ success: true, token });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // To add doctor
  async addDoctor(req: CustomRequest, res: Response): Promise<void> {
    try {
      const {
        name,
        email,
        password,
        speciality,
        degree,
        experience,
        about,
        fees,
        address,
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
        imagePath: imageFile?.path,
      };
      const message = await this._adminService.addDoctor(doctorDTO);
      res.status(HttpStatus.CREATED).json({ success: true, message });
      return;
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // To get all the doctors
  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._adminService.getDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // To get all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this._adminService.getUsers();
      res.status(HttpStatus.OK).json({ success: true, users });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // To toggle the state of user
  async toggleUserBlock(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { block } = req.body as { block?: boolean };

      if (typeof block !== "boolean") {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Block status is required and must be a boolean",
        });
        return;
      }

      const message = await this._adminService.toggleUserBlock(userId, block);
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For getting all the appointments
  async appointmentsList(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await this._adminService.listAppointments();
      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For appointment cancelation
  async adminCancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;

      await this._adminService.cancelAppointment(appointmentId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Appointment cancelled" });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For admin dashboard
  async adminDashboard(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._adminService.getDoctors();
      const users = await this._adminService.getUsers();
      const appointments = await this._adminService.listAppointments();

      const dashData = {
        doctors: doctors.length,
        patients: users.length,
        appointments: appointments.length,
        latestAppointments: appointments.reverse().slice(0, 5),
      };

      res.status(HttpStatus.OK).json({ success: true, dashData });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
}
