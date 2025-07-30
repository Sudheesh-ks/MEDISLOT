import { Request, Response } from "express";

export interface IChatController {
  getChatHistory(req: Request, res: Response): Promise<void>;
  deleteMessage(req: Request, res: Response): Promise<void>;
  markRead(req: Request, res: Response): Promise<void>;
  uploadFile(req: Request, res: Response): Promise<void>;
}
