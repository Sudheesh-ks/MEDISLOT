import { Request, Response } from "express";

export interface IDoctorController {
  changeAvailability(req: Request, res: Response): Promise<void>;
  doctorList(req: Request, res: Response): Promise<void>;
}