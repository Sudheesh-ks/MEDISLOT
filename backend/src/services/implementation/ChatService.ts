import {
  MessageDocument,
  MessageKind,
} from "../../models/messageModel";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { IChatService } from "../interface/IChatService";

export class ChatService implements IChatService {
  constructor(private repo: IChatRepository) {}

  fetchChatHistory(
    chatId: string,
    limit = 1000,
    before?: Date
  ): Promise<MessageDocument[]> {
    return this.repo.getMessagesByChatId(chatId, limit, before);
  }

  sendMessage(dto: {
    chatId: string;
    senderId: string;
    receiverId: string;
    senderRole: "user" | "doctor";
    kind: MessageKind;
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    replyTo?: string;
  }): Promise<MessageDocument> {
    return this.repo.createMessage(dto);
  }

  delivered(messageId: string, userId: string): Promise<void> {
    return this.repo.markDelivered(messageId, userId);
  }

  read(chatId: string, userId: string): Promise<void> {
    return this.repo.markRead(chatId, userId);
  }

  delete(messageId: string): Promise<void> {
    return this.repo.softDelete(messageId);
  }
}
