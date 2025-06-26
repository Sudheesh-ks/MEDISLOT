import { MessageDocument } from "../../models/messageModel";

export interface IChatService {
  fetchChatHistory(chatId: string): Promise<MessageDocument[]>;
}
