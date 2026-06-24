import { Request, Response } from 'express';

export interface IChatBotController {
  sendChatMessage(req: Request, res: Response): Promise<void>;
  getChatHistory(req: Request, res: Response): Promise<void>;
}
