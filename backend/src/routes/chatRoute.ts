import express from "express";
import { ChatRepository } from "../repositories/implementation/ChatRepository";
import { ChatService } from "../services/implementation/ChatService";
import { ChatController } from "../controllers/implementation/ChatController";
import { upload, uploadMemory } from "../middlewares/multer";

const chatRouter = express.Router();

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

chatRouter.get("/:chatId", chatController.getChatHistory.bind(chatController));
chatRouter.delete("/message/:messageId", chatController.deleteMessage.bind(chatController));
chatRouter.patch("/:chatId/read", chatController.markRead.bind(chatController));

chatRouter.post(
  "/upload",
  uploadMemory.single("file"),                     // ✨ CHANGED
  chatController.uploadFile.bind(chatController)   // controller handles Cloudinary
);

export default chatRouter;
