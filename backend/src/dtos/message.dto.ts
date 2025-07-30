import { MessageKind } from "../types/message";

export interface MessageDTO {
  _id?: string;
  id?: string;
  chatId: string;
  senderId: string;
  receiverId?: string;
  senderRole: "user" | "doctor";
  text?: string;
  kind: MessageKind;
  mediaUrl?: string;
  mediaType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
