import { IChatService } from "../interface/IChatService";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { MessageDocument } from "../../models/messageModel";

export class ChatService implements IChatService {
  constructor(private _chatRepository: IChatRepository) {}

  async fetchChatHistory(chatId: string): Promise<MessageDocument[]> {
    return await this._chatRepository.getMessagesByChatId(chatId);
  }
}
