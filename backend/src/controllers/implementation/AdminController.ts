import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminController } from "../interface/IadminController.interface";
import { CustomRequest } from "../../types/customRequest";
import { HttpStatus } from "../../constants/status.constants";
import { DoctorDTO } from "../../types/doctor";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.utils";

export class AdminController implements IAdminController {
  constructor(private _adminService: IAdminService) {}

  // For Admin login
 async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: HttpResponse.ADMIN_FIELDS_REQUIRED,
        });
        return;
      }

      const { admin, accessToken, refreshToken } = await this._adminService.login(email, password);

      res
        .cookie("refreshToken_admin", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/admin/refresh-token",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(HttpStatus.OK)
        .json({
          success: true,
          token: accessToken,
          message: HttpResponse.LOGIN_SUCCESS,
        });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.UNAUTHORIZED,
      });
    }
  }

  // Admin Refresh Token
  async refreshAdminToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken_admin;
      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: HttpResponse.REFRESH_TOKEN_MISSING,
        });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: HttpResponse.REFRESH_TOKEN_INVALID,
        });
        return;
      }
    const admin = await this._adminService.getAdminById(decoded.id); // ✅ REPO layer abstraction
    if (!admin) throw new Error("Admin not found");

    const newAccessToken = generateAccessToken(admin._id, admin.email, "admin");
    const newRefreshToken = generateRefreshToken(admin._id);

      res.cookie("refreshToken_admin", newRefreshToken, {
        httpOnly: true,
        path: "/api/admin/refresh-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json({
        success: true,
        token: newAccessToken,
      });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.REFRESH_TOKEN_FAILED,
      });
    }
  }

  // Admin Logout
  async logoutAdmin(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken_admin", {
      httpOnly: true,
      path: "/api/admin/refresh-token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.LOGOUT_SUCCESS,
    });
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

  // To get paginated doctors
  async getDoctorsPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      
      const result = await this._adminService.getDoctorsPaginated(page, limit);
      res.status(HttpStatus.OK).json({ success: true, ...result });
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

  // To get paginated users
  async getUsersPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      
      const result = await this._adminService.getUsersPaginated(page, limit);
      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // To toggle the state of user
  async toggleUserBlock(req: Request, res: Response): Promise<void> {
      console.log("🔔 toggleUserBlock hit");
    try {
    const { userId } = req.params; // ✅ This is correct now
    const { block } = req.body as { block?: boolean };

    console.log("PARAM userId:", userId);
    console.log("BODY block:", block);

      if (typeof block !== "boolean") {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: HttpResponse.BLOCK_STATUS_INVALID,
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

  async approveDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      const message = await this._adminService.approveDoctor(doctorId);
      res.status(HttpStatus.OK).json({ success: true, message });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async rejectDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.id;
      const message = await this._adminService.rejectDoctor(doctorId);
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

  // For getting paginated appointments
  async appointmentsListPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      
      const result = await this._adminService.listAppointmentsPaginated(page, limit);
      res.status(HttpStatus.OK).json({ success: true, ...result });
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
        .json({ success: true, message: HttpResponse.APPOINTMENT_CANCELLED });
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
