import express from "express";
import { ChatRepository } from "../repositories/implementation/ChatRepository";
import { ChatService } from "../services/implementation/ChatService";
import { ChatController } from "../controllers/implementation/ChatController";

const chatRouter = express.Router();

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

chatRouter.get("/:chatId", chatController.getChatHistory.bind(chatController));

export default chatRouter;
