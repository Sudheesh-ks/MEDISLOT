import express from 'express';
import { uploadMemory } from '../middlewares/multer';
import { chatController } from '../dependencyHandlers/chats.dependencies';

const chatRouter = express.Router();

chatRouter.get('/:chatId', chatController.getChatHistory.bind(chatController));
chatRouter.delete('/message/:messageId', chatController.deleteMessage.bind(chatController));
chatRouter.patch('/:chatId/read', chatController.markRead.bind(chatController));

chatRouter.post(
  '/upload',
  uploadMemory.single('file'),
  chatController.uploadFile.bind(chatController)
);

export default chatRouter;
