import { MessageDTO } from "../../dtos/message.dto";
import { toMessageDTO } from "../../mappers/message.mapper";
import { IChatRepository } from "../../repositories/interface/IChatRepository";
import { MessageKind } from "../../types/message";
import { IChatService } from "../interface/IChatService";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export class ChatService implements IChatService {
  constructor(private readonly _chatRepository: IChatRepository) {}

  async fetchChatHistory(
    chatId: string,
    limit = 1000,
    before?: Date
  ): Promise<MessageDTO[]> {
    const messages = await this._chatRepository.getMessagesByChatId(chatId, limit, before);
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
    const message = await this._chatRepository.createMessage(dto);
    return toMessageDTO(message);
  }

  delivered(messageId: string, userId: string): Promise<void> {
    return this._chatRepository.markDelivered(messageId, userId);
  }

  read(chatId: string, userId: string): Promise<void> {
    return this._chatRepository.markRead(chatId, userId);
  }

  delete(messageId: string): Promise<void> {
    return this._chatRepository.softDelete(messageId);
  }

  async uploadFile(
    file?: Express.Multer.File
  ): Promise<{ result: string; mime: string }> {
    if (!file) throw new Error("File missing");

    const isImage = file.mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const uploadPromise = () =>
      new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat", resource_type: resourceType },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string });
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const result = await uploadPromise();
    return { result: result.secure_url, mime: file.mimetype };
  }
}
