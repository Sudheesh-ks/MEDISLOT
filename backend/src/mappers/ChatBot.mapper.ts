import { chatBotDTO } from '../dtos/Chatbot.dto';
import { chatBotDocument } from '../models/ChatBotModel';

export const toChatBotDTO = (chatbot: chatBotDocument): chatBotDTO => {
  return {
    _id: chatbot._id?.toString(),
    userId: chatbot.userId,
    role: chatbot.role,
    text: chatbot.text,
    createdAt: chatbot.createdAt,
  };
};
