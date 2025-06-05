import { Request, Response } from "express";
import { CustomRequest } from "../../types/customRequest";

export interface IAdminController {
  loginAdmin(req: Request, res: Response): Promise<void>;
  addDoctor(req: CustomRequest, res: Response): Promise<void>;
  getDoctors(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  toggleUserBlock(req: Request, res: Response): Promise<void>;
}
