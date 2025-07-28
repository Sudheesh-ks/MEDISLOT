import { Types } from "mongoose";

export type MessageKind = "text" | "image" | "file" | "emoji";
export interface IStatus { userId: string; at: Date }

export interface MessageType {
  _id?: string;
   chatId: string;
    senderId: string;
    senderRole: "user" | "doctor";
    receiverId?: string;          
  
    kind: MessageKind;
    text?: string;
  
    mediaUrl?: string;
    mediaType?: string;
  
    replyTo?: Types.ObjectId | string;
  
    deliveredTo: IStatus[];
    readBy:      IStatus[];
  
    deleted:  boolean;
    deletedAt?: Date;
  
    createdAt: Date;
    updatedAt: Date;
} 