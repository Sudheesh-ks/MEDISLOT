import { Schema, model, Types, Document } from "mongoose";
import { MessageType } from "../types/message";

export interface MessageDocument extends Omit<MessageType, "_id">, Document {
  _id: Types.ObjectId;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["user", "doctor"],
      required: true,
    },

    receiverId: String,

    kind: {
      type: String,
      enum: ["text", "image", "file", "emoji"],
      default: "text",
    },

    text: String,
    mediaUrl: String,
    mediaType: String,

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    deliveredTo: [{ userId: String, at: Date }],
    readBy: [{ userId: String, at: Date }],

    deleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,
  },

  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export default model<MessageDocument>("Message", MessageSchema);
