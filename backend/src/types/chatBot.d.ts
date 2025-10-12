import { Types } from 'mongoose';

export interface chatBotTypes {
  _id?: string;
  userId: string | Types.ObjectId;
  role: 'user' | 'bot';
  text: string;
  createdAt?: Date;
}
