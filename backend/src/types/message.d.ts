export interface MessageType {
  _id?: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  senderRole: 'user' | 'doctor';
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  emoji?: string;
  replyTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 