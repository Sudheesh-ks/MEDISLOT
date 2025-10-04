import MessageModel, { MessageDocument } from '../../models/messageModel';
import ChatModel from '../../models/chatModel';
import { IChatRepository } from '../interface/IChatRepository';
import { BaseRepository } from '../BaseRepository';

export class ChatRepository extends BaseRepository<MessageDocument> implements IChatRepository {
  async getMessagesByChatId(
    chatId: string,
    limit: number = 1000,
    before?: Date
  ): Promise<MessageDocument[]> {
    const query: any = { chatId };
    if (before) query.createdAt = { $lt: before };

    return MessageModel.find(query)
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean<MessageDocument[]>()
      .exec();
  }

  async createMessage(payload: Partial<MessageDocument>): Promise<MessageDocument> {
    const msg = await MessageModel.create(payload);

    await ChatModel.findByIdAndUpdate(
      msg.chatId,
      {
        $set: { lastMessage: msg._id, lastMessageAt: msg.createdAt },
        $inc: { [`unreadCount.${msg.receiverId}`]: 1 },
        $setOnInsert: {
          participants: [
            { id: msg.senderId, role: msg.senderRole },
            {
              id: msg.receiverId,
              role: msg.senderRole === 'user' ? 'doctor' : 'user',
            },
          ],
        },
      },
      { upsert: true }
    );

    return msg;
  }

  async markDelivered(messageId: string, userId: string): Promise<void> {
    await MessageModel.updateOne(
      { _id: messageId, 'deliveredTo.userId': { $ne: userId } },
      { $push: { deliveredTo: { userId, at: new Date() } } }
    ).exec();
  }

  async markRead(chatId: string, userId: string): Promise<void> {
    await MessageModel.updateMany(
      { chatId, 'readBy.userId': { $ne: userId } },
      { $push: { readBy: { userId, at: new Date() } } }
    ).exec();
  }

  async softDelete(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, {
      deleted: true,
      deletedAt: new Date(),
    }).exec();
  }
}
