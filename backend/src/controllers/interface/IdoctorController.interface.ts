import { Request, Response } from "express";

export interface IDoctorController {
  changeAvailability(req: Request, res: Response): Promise<void>;
  doctorList(req: Request, res: Response): Promise<void>;
  getDoctorsPaginated(req: Request, res: Response): Promise<void>;
  appointmentsDoctor(req: Request, res: Response): Promise<void>;
  appointmentsDoctorPaginated(req: Request, res: Response): Promise<void>;
  appointmentConfirm(req: Request, res: Response): Promise<void>;
  appointmentCancel(req: Request, res: Response): Promise<void>;
  updateDoctorProfile(req: Request, res: Response): Promise<void>;
}
