import express from 'express';
import authRole from '../middlewares/authRole';
import { chatBotController } from '../dependencyHandlers/aiChatBot.dependencies';

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
