import { Request, Response } from "express";

export interface ISlotController {
  updateDaySlot(req: Request, res: Response): Promise<void>;
  getDaySlot(req: Request, res: Response): Promise<void>;
}
