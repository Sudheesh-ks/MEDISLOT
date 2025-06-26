import { IChatRepository } from "../interface/IChatRepository";
import MessageModel, { MessageDocument } from "../../models/messageModel";

export class ChatRepository implements IChatRepository {
  async getMessagesByChatId(chatId: string): Promise<MessageDocument[]> {
    return await MessageModel.find({ chatId }).sort({ createdAt: 1 });
  }
}
