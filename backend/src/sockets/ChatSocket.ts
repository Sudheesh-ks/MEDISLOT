import { Server, Socket } from "socket.io";
import { ChatService } from "../services/implementation/ChatService";

/** in-memory presence (swap for Redis later) */
const onlineUsers = new Map<string, Set<string>>();

export function registerChatSocket(io: Server, chatService: ChatService) {
  io.on("connection", (socket: Socket) => {
    /* -------- 0. identify -------- */
    const { userId, role } = socket.handshake.auth as {
      userId?: string;
      role?: "user" | "doctor";
    };
    if (!userId || !role) return socket.disconnect();

    let set = onlineUsers.get(userId);
    if (!set) {
      set = new Set<string>();
      onlineUsers.set(userId, set);
    }
    const wasOffline = set.size === 0;      // ← first socket?
    set.add(socket.id);
    if (wasOffline) {
      io.emit("presence", { userId, online: true }); // broadcast only once
    }

    /* -------- 1. join room -------- */
    socket.on("join", (chatId: string) => socket.join(chatId));

    /* -------- 2. send message ----- */
    socket.on(
      "sendMessage",
      async (msg: {
        chatId: string;
        receiverId: string;
        kind: "text" | "image" | "file" | "emoji";
        text?: string;
        mediaUrl?: string;
        mediaType?: string;
        replyTo?: string;
      }) => {
        try {
          const saved = await chatService.sendMessage({
            ...msg,
            senderId: userId,
            senderRole: role,
            replyTo: msg.replyTo,
          });

          io.to(saved.chatId).emit("receiveMessage", saved);

        await chatService.delivered(saved.id, msg.receiverId);
           io.to(saved.chatId).emit("delivered", {
           messageId: saved.id,
            userId: msg.receiverId,
            at: new Date(),
          });
        } catch (err) {
          console.error("sendMessage error:", err);
        }
      }
    );

    /* -------- 3. typing ------------ */
    socket.on("typing", ({ chatId }) =>
      socket.to(chatId).emit("typing", { userId })
    );
    socket.on("stopTyping", ({ chatId }) =>
      socket.to(chatId).emit("stopTyping", { userId })
    );

    /* -------- 4. read -------------- */
    socket.on("read", async ({ chatId }) => {
      await chatService.read(chatId, userId);
      socket.to(chatId).emit("readBy", { chatId, userId, at: new Date() });
    });

    /* -------- 5. delete ------------ */
    socket.on("deleteMessage", async ({ messageId, chatId }) => {
      await chatService.delete(messageId);
      io.to(chatId).emit("messageDeleted", { messageId });
    });

    /* -------- 6. disconnect -------- */
    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence", { userId, online: false });
        }
      }
    });
  });
}
