import { ChatBotRepository } from '../repositories/implementation/chatBotRepository';
import { ChatBotService } from '../services/implementation/chatBotService';
import { ChatBotController } from '../controllers/implementation/ChatBotController';

// Repository
const chatBotRepository = new ChatBotRepository();

// Service
const chatBotService = new ChatBotService(chatBotRepository);

// Controller
export const chatBotController = new ChatBotController(chatBotService);
