import chatBotModel, { chatBotDocument } from '../../models/chatBotModel';

export class ChatBotRepository {
  async saveMessage(userId: string, role: 'user' | 'bot', text: string): Promise<chatBotDocument> {
    return await chatBotModel.create({ userId, role, text });
  }

  async getHistory(userId: string): Promise<chatBotDocument[]> {
    return await chatBotModel.find({ userId }).sort({ createdAt: 1 }).lean();
  }
}
