import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/implementation/ChatService';

const onlineUsers = new Map<string, Set<string>>();

// 👇 Make this nullable until initialized
export let ioInstance: Server | null = null;

export function registerChatSocket(io: Server, chatService: ChatService) {
  ioInstance = io; // ✅ store global reference for cron jobs, etc.

  io.on('connection', (socket: Socket) => {
    // ---- AUTH & JOIN ----
    const { userId, role } = socket.handshake.auth as {
      userId?: string;
      role?: 'user' | 'doctor';
    };

    // ✅ Defensive check: disconnect if missing auth
    if (!userId || !role) {
      console.warn('Socket missing auth — disconnecting');
      return socket.disconnect(true);
    }

    // ✅ Join user-specific room
    socket.join(userId.toString());
    console.log(`✅ ${role} connected: ${userId} (socket ${socket.id})`);

    // ---- PRESENCE TRACKING ----
    let set = onlineUsers.get(userId);
    if (!set) {
      set = new Set<string>();
      onlineUsers.set(userId, set);
    }
    const wasOffline = set.size === 0;
    set.add(socket.id);
    if (wasOffline) {
      io.emit('presence', { userId, online: true });
    }

    // ---- CHAT EVENTS ----
    socket.on('join', (chatId: string) => socket.join(chatId));

    socket.on(
      'sendMessage',
      async (msg: {
        chatId: string;
        receiverId: string;
        kind: 'text' | 'image' | 'file' | 'emoji';
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
          });

          io.to(saved.chatId).emit('receiveMessage', saved);

          if (msg.receiverId) {
            await chatService.delivered(saved.id!, msg.receiverId);
          }

          io.to(saved.chatId).emit('delivered', {
            messageId: saved.id,
            userId: msg.receiverId,
            at: new Date(),
          });

          // ✅ Notification for receiver
          io.to(msg.receiverId).emit('dmNotice', {
            chatId: saved.chatId,
            from: { id: userId, role },
            preview: saved.text || (saved.kind === 'image' ? '📷 image' : '📄 file'),
          });
        } catch (err) {
          console.error('sendMessage error:', err);
        }
      }
    );

    socket.on('typing', ({ chatId }) => socket.to(chatId).emit('typing', { userId }));
    socket.on('stopTyping', ({ chatId }) => socket.to(chatId).emit('stopTyping', { userId }));

    socket.on('read', async ({ chatId }) => {
      await chatService.read(chatId, userId);
      socket.to(chatId).emit('readBy', { chatId, userId, at: new Date() });
    });

    socket.on('deleteMessage', async ({ messageId, chatId }) => {
      await chatService.delete(messageId);
      io.to(chatId).emit('messageDeleted', { messageId });
    });

    // ---- VIDEO CALL EVENTS ----
    socket.on('join-video-room', (appointmentId: string) => {
      socket.join(appointmentId);

      const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(appointmentId) || []);
      console.log(`🎥 ${userId} joined video room ${appointmentId}, clients:`, clientsInRoom);

      socket.emit('joined-room');
      socket.to(appointmentId).emit('other-user-joined');
    });

    socket.on('webrtc-offer', ({ appointmentId, offer, senderId }) => {
      socket.to(appointmentId).emit('webrtc-offer', { offer, senderId });
    });

    socket.on('webrtc-answer', ({ appointmentId, answer, senderId }) => {
      socket.to(appointmentId).emit('webrtc-answer', { answer, senderId });
    });

    socket.on('ice-candidate', ({ appointmentId, candidate, senderId }) => {
      socket.to(appointmentId).emit('ice-candidate', { candidate, senderId });
    });

    socket.on('end-call', ({ appointmentId }) => {
      socket.to(appointmentId).emit('end-call');
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence', { userId, online: false });
        }
      }
      console.log(`❌ ${role} disconnected: ${userId} (socket ${socket.id})`);
    });
  });
}
