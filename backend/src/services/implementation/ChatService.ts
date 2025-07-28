import { MessageDTO } from "../../dtos/message.dto";
import { toMessageDTO } from "../../mappers/message.mapper";
import { MessageDocument } from "../../models/messageModel";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { MessageKind } from "../../types/message";
import { IChatService } from "../interface/IChatService";

export class ChatService implements IChatService {
  constructor(private repo: IChatRepository) {}

  async fetchChatHistory(
    chatId: string,
    limit = 1000,
    before?: Date
  ): Promise<MessageDTO[]> {
    const messages = await this.repo.getMessagesByChatId(chatId, limit, before);
    return messages.map(toMessageDTO);
  }

  async sendMessage(dto: {
    chatId: string;
    senderId: string;
    receiverId: string;
    senderRole: "user" | "doctor";
    kind: MessageKind;
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    replyTo?: string;
  }): Promise<MessageDTO> {
    const message = await this.repo.createMessage(dto);
    return toMessageDTO(message);
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
