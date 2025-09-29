import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/implementation/ChatService';

const onlineUsers = new Map<string, Set<string>>();

export let ioInstance: Server;

export function registerChatSocket(io: Server, chatService: ChatService) {
  ioInstance = io;

  // For connection
  io.on('connection', (socket: Socket) => {
    const { userId, role } = socket.handshake.auth as {
      userId?: string;
      role?: 'user' | 'doctor';
    };
    if (!userId || !role) return socket.disconnect();
    // For joining
    socket.join(userId);

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

    socket.on('join', (chatId: string) => socket.join(chatId));

    // For sending messages
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
            replyTo: msg.replyTo,
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

          // For notifications
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

    // For typing indicator
    socket.on('typing', ({ chatId }) => socket.to(chatId).emit('typing', { userId }));

    // For stopping type indicator
    socket.on('stopTyping', ({ chatId }) => socket.to(chatId).emit('stopTyping', { userId }));

    // For marking as read
    socket.on('read', async ({ chatId }) => {
      await chatService.read(chatId, userId);
      socket.to(chatId).emit('readBy', { chatId, userId, at: new Date() });
    });

    // For deleting message
    socket.on('deleteMessage', async ({ messageId, chatId }) => {
      await chatService.delete(messageId);
      io.to(chatId).emit('messageDeleted', { messageId });
    });

    // For stating offline
    socket.on('disconnect', () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence', { userId, online: false });
        }
      }
    });

    // For joining video call room
    socket.on('join-video-room', (appointmentId: string) => {
      socket.join(appointmentId);
      const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(appointmentId) || []);

      console.log(`User ${socket.id} joined video room ${appointmentId}`);
      console.log('Clients in room:', clientsInRoom);

      if (clientsInRoom.length === 1) {
        socket.emit('joined-room');
      } else {
        socket.emit('joined-room');
        socket.to(appointmentId).emit('other-user-joined');
      }
    });

    socket.on('webrtc-offer', ({ appointmentId, offer, senderId }) => {
      socket.to(appointmentId).emit('webrtc-offer', { offer, senderId });
    });

    socket.on('webrtc-answer', ({ appointmentId, answer, senderId }) => {
      socket.to(appointmentId).emit('webrtc-answer', { answer, senderId });
    });

    socket.on('ice-candidate', ({ appointmentId, candidate, senderId }) => {
      socket.to(appointmentId).emit('ice-candidate', {
        candidate,
        senderId,
      });
    });

    socket.on('end-call', ({ appointmentId }) => {
      socket.to(appointmentId).emit('end-call');
    });
  });
}
