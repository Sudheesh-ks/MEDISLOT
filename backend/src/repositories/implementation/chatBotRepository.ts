import chatBotModel, { chatBotDocument } from '../../models/chatBotModel';
import { BaseRepository } from '../BaseRepository';
import { IChatBotRepository } from '../interface/IChatBotRepository';

export class ChatBotRepository
  extends BaseRepository<chatBotDocument>
  implements IChatBotRepository
{
  constructor() {
    super(chatBotModel);
  }
  async saveMessage(userId: string, role: 'user' | 'bot', text: string): Promise<chatBotDocument> {
    return await this.model.create({ userId, role, text });
  }

  async getHistory(userId: string): Promise<chatBotDocument[]> {
    return await this.model.find({ userId }).sort({ createdAt: 1 }).lean();
  }

  async getRecentChatSummary(userId: string, limit: number = 3): Promise<chatBotDocument[]> {
    return await this.model.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
