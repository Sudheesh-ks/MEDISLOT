import { MessageDocument, MessageKind } from "../../models/messageModel";

export interface IChatService {
  fetchChatHistory(
    chatId: string,
    limit?: number,
    before?: Date
  ): Promise<MessageDocument[]>;

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
  }): Promise<MessageDocument>;

  delivered(messageId: string, userId: string): Promise<void>;
  read(chatId: string, userId: string): Promise<void>;
  delete(messageId: string): Promise<void>;
}
