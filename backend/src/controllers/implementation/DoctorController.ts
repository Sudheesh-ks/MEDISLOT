import { Request, Response } from "express";
import { DoctorService } from "../../services/implementation/DoctorService";
import { IDoctorController } from "../interface/IdoctorController.interface";
import { HttpStatus } from "../../constants/status.constants";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { DoctorTypes } from "../../types/doctor";
import { DoctorSlotService } from "../../services/implementation/SlotService";
import logger from "../../utils/logger";

export class DoctorController implements IDoctorController {
  constructor(private _doctorService: DoctorService) {}

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      const imageFile = req.file;

      if (!imageFile) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Doctor image is required",
        });
        return;
      }

      const doctorDTO: DoctorTypes = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        experience: req.body.experience,
        about: req.body.about,
        speciality: req.body.speciality,
        degree: req.body.degree,
        fees: Number(req.body.fees),
        address: req.body.address,
        image: imageFile.path,
      };

      await this._doctorService.registerDoctor(doctorDTO);
      logger.info(`Doctor registered successfully: ${req.body.email}`);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: HttpResponse.DOCTOR_REGISTER_SUCCESS,
      });
    } catch (error) {
      logger.error(`Doctor registration failed: ${(error as Error).message}`);

      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const doctor = await this._doctorService.getPublicDoctorById(
        req.params.id
      );
      logger.info(`Fetched doctor by ID: ${req.params.id}`);

      res.status(HttpStatus.OK).json({ success: true, doctor });
    } catch (err) {
      logger.error(`Doctor not found: ${(err as Error).message}`);

      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }

  async changeAvailability(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId || req.params.doctorId || req.params.id;
      await this._doctorService.toggleAvailability(docId);
      logger.info(`Doctor availability toggled: ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.DOCTOR_AVAILABILITY_CHANGE,
      });
    } catch (error) {
      logger.error(`Error changing availability: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._doctorService.getAllDoctors();
      logger.info("Fetched all doctors");

      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      logger.error(`Error fetching doctors: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDoctorsPaginated(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._doctorService.getDoctorsPaginated(req.query);
      logger.info("Fetched paginated doctors list");

      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(
        `Error in paginated doctor fetch: ${(error as Error).message}`
      );

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { token: accessToken, refreshToken } =
        await this._doctorService.loginDoctor(req.body);

      res.cookie("refreshToken_doctor", refreshToken, {
        httpOnly: true,
        path: "/api/doctor/refresh-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      logger.info(`Doctor login: ${req.body.email}`);

      res.status(HttpStatus.OK).json({
        success: true,
        token: accessToken,
        message: HttpResponse.LOGIN_SUCCESS,
      });
    } catch (error) {
      logger.error(`Doctor login failed: ${(error as Error).message}`);

      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.UNAUTHORIZED,
      });
    }
  }

  async refreshDoctorToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, refreshToken } = await this._doctorService.refreshToken(
        req.cookies?.refreshToken_doctor
      );

      res.cookie("refreshToken_doctor", refreshToken, {
        httpOnly: true,
        path: "/api/doctor/refresh-token",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      logger.info("Doctor token refreshed");

      res.status(HttpStatus.OK).json({
        success: true,
        token,
      });
    } catch (error) {
      logger.error(`Doctor token refresh failed: ${(error as Error).message}`);

      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.REFRESH_TOKEN_FAILED,
      });
    }
  }

  async logoutDoctor(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken_doctor", {
      httpOnly: true,
      path: "/api/doctor/refresh-token",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    logger.info("Doctor logged out");

    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpResponse.LOGOUT_SUCCESS,
    });
  }

  // For getting doctor appointments
  async appointmentsDoctor(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;

      const appointments = await this._doctorService.getDoctorAppointments(
        docId
      );
      logger.info(`Fetched appointments for doctor: ${docId}`);

      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      logger.error(
        `Error fetching doctor appointments: ${(error as Error).message}`
      );

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // For getting doctor appointments
  async appointmentsDoctorPaginated(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const docId = (req as any).docId;

      const result = await this._doctorService.getDoctorAppointmentsPaginated(
        docId,
        req.query.page as string,
        req.query.limit as string
      );
      logger.info(`Fetched paginated appointments for doctor: ${docId}`);

      res.status(HttpStatus.OK).json({ success: true, ...result });
    } catch (error) {
      logger.error(
        `Error fetching paginated appointments: ${(error as Error).message}`
      );

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async appointmentConfirm(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.confirmAppointment(docId, appointmentId);
      logger.info(`Appointment confirmed: ${appointmentId} by ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_CONFIRMED,
      });
    } catch (error) {
      logger.error(`Confirm appointment error: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async appointmentCancel(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.cancelAppointment(docId, appointmentId);
      logger.info(`Appointment cancelled: ${appointmentId} by ${docId}`);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.APPOINTMENT_CANCELLED,
      });
    } catch (error) {
      logger.error(`Cancel appointment error: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getActiveAppointment(req: Request, res: Response): Promise<void> {
  try {
    const docId = (req as any).docId;
    const appointment = await this._doctorService.getActiveAppointment(docId);

    if (!appointment) {
       res.json({ active: false });
       return
    }

    logger.info(`Appointment is active`);

     res.status(HttpStatus.OK).json({
      active: true,
      appointmentId: appointment._id,
      userId: appointment.userData._id,
      doctorId: appointment.docData._id,
    });
    return;

  } catch (error) {
    logger.error(`Get active appointment error: ${error}`);
     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: (error as Error).message,
    });
  }
}

  async doctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const doctId = (req as any).docId;
      const profileData = await this._doctorService.getDoctorProfile(doctId);
      logger.info(`Fetched profile for doctor: ${doctId}`);

      res.json({ success: true, profileData });
    } catch (error) {
      logger.error(`Doctor profile fetch failed: ${(error as Error).message}`);
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async updateDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._doctorService.updateDoctorProfile(
        req.body,
        req.file
      );
      logger.info(`Doctor profile updated: ${(req as any).docId}`);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Doctor profile updated successfully",
      });
    } catch (error) {
      logger.error(`Update doctor profile failed: ${(error as Error).message}`);

      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

    async getDoctorWallet(req: Request, res: Response) {
    try {
      const doctorId = (req as any).docId;
      const wallet = await this._doctorService.getDoctorWallet(doctorId);
      logger.info(`Wallet fetched for doctor: ${doctorId}`);
      res.status(200).json(wallet);
    } catch (error) {
      logger.error(`Get wallet error: ${error}`);
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
        }
  }
}
