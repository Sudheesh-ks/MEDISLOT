import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { chatBotTypes } from '../types/aiChatHistory';

export interface chatBotDocument extends Omit<chatBotTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const chatBotSchema: Schema<chatBotDocument> = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatBotModel: Model<chatBotDocument> = mongoose.model<chatBotDocument>(
  'ChatBot',
  chatBotSchema
);

export default chatBotModel;
