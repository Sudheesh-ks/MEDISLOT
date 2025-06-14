import { Request, Response } from "express";
import { DoctorService } from "../../services/implementation/DoctorService";
import { IDoctorController } from "../interface/IdoctorController.interface";
import { HttpStatus } from "../../constants/status.constants";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { DoctorData, DoctorDTO } from "../../types/doctor";

export class DoctorController implements IDoctorController {
  constructor(private _doctorService: DoctorService) {}

  // For doctor registration
  async registerDoctor(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      password,
      experience,
      about,
      speciality,
      degree,
      fees,
      address,
    } = req.body;

    const imageFile = req.file;

    if (!imageFile) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Doctor image is required",
      });
      return;
    }

    const doctorDTO: DoctorDTO = {
      name,
      email,
      password,
      experience,
      about,
      speciality,
      degree,
      fees: Number(fees),
      address: JSON.parse(address),
      imagePath: imageFile.path,
    };

    await this._doctorService.registerDoctor(doctorDTO);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: HttpResponse.DOCTOR_REGISTER_SUCCESS,
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: (error as Error).message,
    });
  }
}

  // For updating doctor availability
  async changeAvailability(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId || req.params.doctorId || req.params.id;
      await this._doctorService.toggleAvailability(docId);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.DOCTOR_AVAILABILITY_CHANGE });
    } catch (error) {
      console.log(error as Error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For getting all doctor profiles
  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this._doctorService.getAllDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For doctor login
  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const token = await this._doctorService.loginDoctor(email, password);
      if (!token) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: HttpResponse.UNAUTHORIZED });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, token });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For getting doctor appointments
  async appointmentsDoctor(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;

      const appointments = await this._doctorService.getDoctorAppointments(docId);

      res.status(HttpStatus.OK).json({ success: true, appointments });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For appointment confirmation
  async appointmentConfirm(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.confirmAppointment(docId, appointmentId);

      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.OK });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }

  // For appointment cancellation
  async appointmentCancel(req: Request, res: Response): Promise<void> {
    try {
      const docId = (req as any).docId;
      const { appointmentId } = req.params;

      await this._doctorService.cancelAppointment(docId, appointmentId);

      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.APPOINTMENT_CANCELLED });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: (error as Error).message });
    }
  }
}
