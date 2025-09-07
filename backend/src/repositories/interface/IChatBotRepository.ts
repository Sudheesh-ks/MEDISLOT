import { chatBotDocument } from '../../models/chatBotModel';

export interface IChatBotRepository {
  saveMessage(userId: string, role: 'user' | 'bot', text: string): Promise<chatBotDocument>;
  getHistory(userId: string): Promise<chatBotDocument[]>;
  getRecentChatSummary(userId: string, limit: number): Promise<chatBotDocument[]>;
}
