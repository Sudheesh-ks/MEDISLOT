import { Request, Response } from 'express';
import { HttpStatus } from '../../constants/status.constants';
import { IChatController } from '../interface/IchatController';
import { IChatService } from '../../services/interface/IChatService';
import logger from '../../utils/logger';

export class ChatController implements IChatController {
  constructor(private chatService: IChatService) {}

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const before = req.query.before ? new Date(String(req.query.before)) : undefined;

      logger.info(`Fetching chat history for chatId=${chatId}, limit=${limit}, before=${before}`);

      const messages = await this.chatService.fetchChatHistory(chatId, limit, before);
      res.status(HttpStatus.OK).json({ success: true, messages });
    } catch (error) {
      logger.error(`Error fetching chat history: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      logger.info(`Deleting message: ${messageId}`);

      await this.chatService.delete(messageId);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      logger.error(`Error deleting message: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;
      logger.info(`Marking chat ${chatId} as read for user ${userId}`);

      await this.chatService.read(chatId, userId);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      logger.error(`Error marking messages read: ${(error as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const { result, mime } = await this.chatService.uploadFile(req.file);
      logger.info(`Uploaded file with MIME type: ${mime}`);

      res.status(HttpStatus.OK).json({
        success: true,
        url: result,
        mime,
      });
    } catch (err) {
      logger.error(`Error uploading file: ${(err as Error).message}`);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }
}
