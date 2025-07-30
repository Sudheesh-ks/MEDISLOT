import { MessageDTO } from "../dtos/message.dto";
import { MessageDocument } from "../models/messageModel";

export const toMessageDTO = (m: MessageDocument): MessageDTO => {
  return {
    _id: m._id.toString(),
    id: m._id.toString(),
    chatId: m.chatId,
    senderId: m.senderId,
    receiverId: m.receiverId,
    senderRole: m.senderRole,
    text: m.text,
    kind: m.kind,
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};
