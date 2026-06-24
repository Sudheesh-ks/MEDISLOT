import { ChatRepository } from '../repositories/implementation/ChatRepository';
import { ChatService } from '../services/implementation/ChatService';
import { ChatController } from '../controllers/implementation/ChatController';

// Repository
const chatRepository = new ChatRepository();

// Service
const chatService = new ChatService(chatRepository);

// Controller
export const chatController = new ChatController(chatService);
