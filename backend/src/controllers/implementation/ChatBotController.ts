import { Request, Response } from 'express';
import { HttpStatus } from '../../constants/status.constants';
import { HttpResponse } from '../../constants/responseMessage.constants';
import logger from '../../utils/logger';
import { IChatBotController } from '../interface/IChatBotController';
import { IChatBotService } from '../../services/interface/IChatBotService';

export class ChatBotController implements IChatBotController {
  constructor(private readonly _chatBotService: IChatBotService) {}

  async sendChatMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { message } = req.body;
      const reply = await this._chatBotService.handleMessage(userId, message);

      res.status(HttpStatus.OK).json({ success: true, reply });
    } catch (error) {
      logger.error(`ChatBotController - sendChatMessage Error: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.SERVER_ERROR,
      });
    }
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const history = await this._chatBotService.getHistory(userId);

      res.status(HttpStatus.OK).json({ success: true, history });
    } catch (error) {
      logger.error(`ChatBotController - getChatHistory Error: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.SERVER_ERROR,
      });
    }
  }

  async getLatestChatSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const summary = await this._chatBotService.getLatestChatSummary(userId);

      res.status(HttpStatus.OK).json({ success: true, summary });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
