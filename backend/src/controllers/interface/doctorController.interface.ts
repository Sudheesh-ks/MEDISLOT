import { Request, Response } from "express";

export interface IDoctorController {
  changeAvailability(req: Request, res: Response): Promise<void>;
  doctorList(req: Request, res: Response): Promise<void>;
  appointmentsDoctor(req: Request, res: Response): Promise<void>;
  appointmentComplete(req: Request, res: Response): Promise<void>;
  appointmentCancel(req: Request, res: Response): Promise<void>;
}
