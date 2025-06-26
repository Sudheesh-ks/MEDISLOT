import { Request, Response } from "express";
// import { ChatService } from "../../services/implementation/ChatService";
// import { ChatRepository } from "../../repositories/implementation/ChatRepository";
import { HttpStatus } from "../../constants/status.constants";
import { IChatController } from "../interface/IchatController";
import { IChatService } from "../../services/interface/IChatService";

export class ChatController implements IChatController {
  constructor(private _chatservice: IChatService) {}
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const messages = await this._chatservice.fetchChatHistory(chatId);
      res.status(HttpStatus.OK).json({ success: true, messages });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
