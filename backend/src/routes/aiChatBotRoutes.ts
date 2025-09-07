import express from 'express';
import { ChatBotRepository } from '../repositories/implementation/chatBotRepository';
import { ChatBotService } from '../services/implementation/chatBotService';
import { ChatBotController } from '../controllers/implementation/ChatBotController';
import authRole from '../middlewares/authRole';

const chatBotRepository = new ChatBotRepository();
const chatBotService = new ChatBotService(chatBotRepository);
const chatBotController = new ChatBotController(chatBotService);

const chatRouter = express.Router();

chatRouter.post(
  '/chat',
  authRole(['user']),
  chatBotController.sendChatMessage.bind(chatBotController)
);

chatRouter.get(
  '/history',
  authRole(['user']),
  chatBotController.getChatHistory.bind(chatBotController)
);

chatRouter.get(
  '/latest-summary/:userId',
  authRole(['doctor']),
  chatBotController.getLatestChatSummary.bind(chatBotController)
);

export default chatRouter;
