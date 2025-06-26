import { MessageDocument } from "../../models/messageModel";

export interface IChatRepository {
  getMessagesByChatId(chatId: string): Promise<MessageDocument[]>;
}
