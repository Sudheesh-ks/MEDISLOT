import { IChatBotService } from '../interface/IChatBotService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpResponse } from '../../constants/responseMessage.constants';
import { IChatBotRepository } from '../../repositories/interface/IChatBotRepository';

export class ChatBotService implements IChatBotService {
  private readonly _model;

  constructor(private readonly _chatBotRepository: IChatBotRepository) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    this._model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });
  }

  private readonly systemPrompt = `
You are a helpful medical chatbot. 
You can provide general health information but do NOT diagnose, prescribe, or give personalized treatment. 
Always advise the user to consult a qualified medical professional.
Respond politely, clearly, and concisely.
If asked non-medical topics, say:
"I'm here to provide general medical information. For other topics, please consult an appropriate expert."
`;

  async handleMessage(userId: string, message: string): Promise<string> {
    if (!userId || !message) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }

    await this._chatBotRepository.saveMessage(userId, 'user', message);

    try {
      const chat = this._model.startChat({
        history: [{ role: 'user', parts: [{ text: this.systemPrompt }] }],
      });

      const result = await chat.sendMessage(message);
      let reply = result.response.text();

      const concernKeywords = [
        'fever',
        'headache',
        'pain',
        'doctor',
        'cough',
        'cold',
        'appointment',
        'not feeling well',
      ];
      const isConcern = concernKeywords.some((word) => message.toLowerCase().includes(word));

      if (isConcern) {
        reply += `\n\n👉 [Book an Appointment](/all-doctors)`;
      }

      await this._chatBotRepository.saveMessage(userId, 'bot', reply);

      return reply;
    } catch (error) {
      console.error('ChatBotService.handleMessage error:', error);
      throw new Error('Failed to generate chatbot response');
    }
  }

  async getHistory(userId: string): Promise<any> {
    if (!userId) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }
    return this._chatBotRepository.getHistory(userId);
  }

  async getLatestChatSummary(userId: string): Promise<string> {
    const recentMessages = await this._chatBotRepository.getRecentChatSummary(userId, 5);

    if (!recentMessages.length) return 'No chat history available.';

    const userConcerns = recentMessages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.text)
      .join('\n');

    const prompt = `
  Summarize the following patient messages into a short paragraph (2–3 sentences).
  Focus only on the health issue they are describing. Be concise and clear.

  Patient messages:
  ${userConcerns}
  `;

    try {
      const chat = this._model.startChat();
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Summarization failed:', err);
      return 'Patient mentioned health concerns, but summary unavailable.';
    }
  }
}
