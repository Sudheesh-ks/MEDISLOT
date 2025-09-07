export interface IChatBotService {
  handleMessage(userId: string, message: string): Promise<string>;
  getHistory(userId: string): Promise<any>;
  getLatestChatSummary(userId: string): Promise<string>;
}
