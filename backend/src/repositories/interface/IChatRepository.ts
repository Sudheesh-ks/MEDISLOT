import { MessageDocument } from '../../models/messageModel';

export interface IChatRepository {
  getMessagesByChatId(chatId: string, limit?: number, before?: Date): Promise<MessageDocument[]>;
  createMessage(payload: Partial<MessageDocument>): Promise<MessageDocument>;
  markDelivered(messageId: string, userId: string): Promise<void>;
  markRead(chatId: string, userId: string): Promise<void>;
  softDelete(messageId: string): Promise<void>;
}
