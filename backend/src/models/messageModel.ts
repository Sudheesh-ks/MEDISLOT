import mongoose, { Schema, Document } from "mongoose";

export interface MessageDocument extends Document {
  chatId: string;
  senderId: string;
  receiverId: string;
  senderRole: "user" | "doctor";
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  emoji?: string;
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    senderRole: { type: String, enum: ["user", "doctor"], required: true },
    message: { type: String, default: "" },
    mediaUrl: { type: String },
    mediaType: { type: String },
    emoji: { type: String },
    replyTo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<MessageDocument>("Message", MessageSchema);
