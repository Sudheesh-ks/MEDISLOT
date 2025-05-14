import { Request, Response } from "express";
import { DoctorService } from "../../services/implementation/DoctorService";
import { IDoctorController } from "../interface/doctorController.interface";
import { HttpStatus } from "../../constants/status.constants";
import { ErrorType } from "../../types/error";


export class DoctorController implements IDoctorController {
  constructor(private doctorService: DoctorService) {}

  async changeAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { docId } = req.body;
      await this.doctorService.toggleAvailability(docId);
      res.status(HttpStatus.OK).json({ success: true, message: "Availability Changed" });
    } catch (error) {
      const err = error as ErrorType;
      console.log(err.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }

  async doctorList(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.doctorService.getAllDoctors();
      res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      const err = error as ErrorType;
      console.log(err.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
    }
  }
}