import { MessageDTO } from '../../dtos/message.dto';
import { MessageKind } from '../../types/message';

export interface IChatService {
  fetchChatHistory(chatId: string, limit?: number, before?: Date): Promise<MessageDTO[]>;

  sendMessage(dto: {
    chatId: string;
    senderId: string;
    receiverId: string;
    senderRole: 'user' | 'doctor';
    kind: MessageKind;
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    replyTo?: string;
  }): Promise<MessageDTO>;

  uploadFile(file?: Express.Multer.File): Promise<{ result: string; mime: string }>;
  delivered(messageId: string, userId: string): Promise<void>;
  read(chatId: string, userId: string): Promise<void>;
  delete(messageId: string): Promise<void>;
}
