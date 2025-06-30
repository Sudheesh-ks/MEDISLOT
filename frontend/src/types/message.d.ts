export type MessageKind = "text" | "image" | "file" | "emoji";

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  senderRole: "user" | "doctor";

  kind: MessageKind;
  text?: string;
  mediaUrl?: string;
  mediaType?: string;

  deliveredTo?: { userId: string; at: string }[];
  readBy?:      { userId: string; at: string }[];

  createdAt: string;
  deleted?: boolean;
}
