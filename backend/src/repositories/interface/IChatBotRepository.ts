import { chatBotDocument } from '../../models/ChatBotModel';

export interface IChatBotRepository {
  saveMessage(userId: string, role: 'user' | 'bot', text: string): Promise<chatBotDocument>;
  getHistory(userId: string): Promise<chatBotDocument[]>;
  getRecentChatSummary(userId: string, limit: number): Promise<chatBotDocument[]>;
}
