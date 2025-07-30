import { Request, Response } from "express";
import { CustomRequest } from "../../types/customRequest";

export interface IAdminController {
  loginAdmin(req: Request, res: Response): Promise<void>;
  refreshAdminToken(req: Request, res: Response): Promise<void>;
  logoutAdmin(req: Request, res: Response): Promise<void>;
  getDoctorsPaginated(req: Request, res: Response): Promise<void>;
  getUsersPaginated(req: Request, res: Response): Promise<void>;
  toggleUserBlock(req: Request, res: Response): Promise<void>;
  appointmentsListPaginated(req: Request, res: Response): Promise<void>;
  adminCancelAppointment(req: Request, res: Response): Promise<void>;
  approveDoctor(req: Request, res: Response): Promise<void>;
  rejectDoctor(req: Request, res: Response): Promise<void>;
  adminDashboard(req: Request, res: Response): Promise<void>;
}
