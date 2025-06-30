// import { Request, Response } from "express";
// // import { ChatService } from "../../services/implementation/ChatService";
// // import { ChatRepository } from "../../repositories/implementation/ChatRepository";
// import { HttpStatus } from "../../constants/status.constants";
// import { IChatController } from "../interface/IchatController";
// import { IChatService } from "../../services/interface/IChatService";

// export class ChatController implements IChatController {
//   constructor(private _chatservice: IChatService) {}
//   async getChatHistory(req: Request, res: Response): Promise<void> {
//     try {
//       const { chatId } = req.params;
//       const messages = await this._chatservice.fetchChatHistory(chatId);
//       res.status(HttpStatus.OK).json({ success: true, messages });
//     } catch (error) {
//       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: (error as Error).message,
//       });
//     }
//   }
// }


import { Request, Response } from "express";
import { HttpStatus } from "../../constants/status.constants";
import { IChatController } from "../interface/IchatController";
import { IChatService } from "../../services/interface/IChatService";
import { v2 as cloudinary } from "cloudinary";           
import { upload } from "../../middlewares/multer";
import streamifier from 'streamifier'


export class ChatController implements IChatController {
  constructor(private chatService: IChatService) {}

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const before = req.query.before ? new Date(String(req.query.before)) : undefined;

      const messages = await this.chatService.fetchChatHistory(
        chatId,
        limit,
        before
      );

      res.status(HttpStatus.OK).json({ success: true, messages });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      await this.chatService.delete(messageId);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;              
      await this.chatService.read(chatId, userId);
      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }


  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      /* 1. validate ---------------------------------------------------------------- */
      if (!req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "file missing" });
        return;
      }

      const file = req.file as Express.Multer.File;

      /* 2. decide resource‑type (image vs raw) ------------------------------------- */
const isImage      = file.mimetype.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";          // ✨ CHANGED

      /* 3. push the in‑memory Buffer to Cloudinary --------------------------------- */
      const uploadPromise = () =>
        new Promise<{ secure_url: string; [k: string]: any }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "chat", resource_type: resourceType },  // ✨ CHANGED
            (error, result) => (error ? reject(error) : resolve(result as any))
          );
streamifier.createReadStream(file.buffer).pipe(stream);         });

      const result = await uploadPromise();

      /* 4. respond ----------------------------------------------------------------- */
      res.json({
        success: true,
        url:  result.secure_url,
mime: file.mimetype,
      });
    } catch (err) {
      console.error(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (err as Error).message,
      });
    }
  }
}

