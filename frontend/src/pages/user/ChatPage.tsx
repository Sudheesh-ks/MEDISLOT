import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { NotifContext } from '../../context/NotificationContext';
import { getDoctorsByIDAPI } from '../../services/doctorServices';
import { getPresence, uploadChatFile, userChat } from '../../services/chatService';
import type { Message } from '../../types/message';

const timeOf = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

const fileName = (url: string) => url.split('/').pop()?.split('?')[0] ?? 'file';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, userData } = useContext(UserContext)!;
  const { socket, markRead } = useContext(NotifContext);

  const { doctorId } = useParams<{ doctorId: string }>();

  const userId = userData?._id;
  const chatId = `${userId}_${doctorId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDoctorOnline, setIsDoctorOnline] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doctorProfile, setDoctorProfile] = useState<{
    name: string;
    avatar: string;
    speciality: string;
    isOnline?: boolean;
  } | null>(null);

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  useEffect(() => {
    if (!doctorId) return;

    getDoctorsByIDAPI(doctorId).then(({ data }) => {
      if (data.success) {
        setDoctorProfile({
          name: data.doctor.name,
          avatar: data.doctor.image || '/placeholder.png',
          speciality: data.doctor.speciality,
        });

        if (data.doctor.status === 'blocked') {
          navigate('/myappointments');
        }
      }
    });

    getPresence(doctorId).then((r) => setIsDoctorOnline(r.data.online));
  }, [doctorId]);

  useEffect(() => {
    if (!socket) return;

    const onPresence = ({ userId: id, online }: { userId: string; online: boolean }) => {
      if (id === doctorId) setIsDoctorOnline(online);
    };

    socket.on('presence', onPresence);
    return () => {
      socket.off('presence', onPresence);
    };
  }, [socket, doctorId]);

  useEffect(() => {
    if (!socket || !chatId) return;

    // To join the chat room
    socket.emit('join', chatId);

    // To make the messages read and remove the notification badge
    markRead(chatId);
    socket.emit('read', { chatId });

    // To get all the messages
    userChat.fetchHistory(chatId).then(({ data }) => data.success && setMessages(data.messages));

    // To get the newly messages
    const onReceive = (m: Message) => setMessages((p) => [...p, m]);
    const onDelivered = (d: any) =>
      setMessages((p) =>
        p.map((m) =>
          m._id === d.messageId
            ? {
                ...m,
                deliveredTo: [...(m.deliveredTo ?? []), { userId: d.userId, at: d.at }],
              }
            : m
        )
      );
    // To mark as read
    const onReadBy = (d: any) =>
      setMessages((p) =>
        p.map((m) =>
          m.chatId === d.chatId
            ? {
                ...m,
                readBy: [...(m.readBy ?? []), { userId: d.userId, at: d.at }],
              }
            : m
        )
      );
    // Typing indicators
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);

    // To delete a message
    const onDeleted = (d: { messageId: string }) =>
      setMessages((p) => p.map((m) => (m._id === d.messageId ? { ...m, deleted: true } : m)));

    socket.on('receiveMessage', onReceive);
    socket.on('delivered', onDelivered);
    socket.on('readBy', onReadBy);
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    socket.on('messageDeleted', onDeleted);

    return () => {
      socket.off('receiveMessage', onReceive);
      socket.off('delivered', onDelivered);
      socket.off('readBy', onReadBy);
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
      socket.off('messageDeleted', onDeleted);
    };
  }, [socket, chatId, doctorId, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!socket) return;

    // To send a file
    if (pickedFile) {
      try {
        const { url, mime } = await uploadChatFile(pickedFile);
        socket.emit('sendMessage', {
          chatId,
          receiverId: doctorId,
          kind: mime.startsWith('image/') ? 'image' : 'file',
          mediaUrl: url,
          mediaType: mime,
        });
        // For reseting preview of the file
        setPickedFile(null);
        clearFileInput();
      } catch (err) {
        console.error('upload failed', err);
      }
      return;
    }

    // For text messages
    if (!newMessage.trim()) return;
    socket.emit('sendMessage', {
      chatId,
      receiverId: doctorId,
      kind: 'text',
      text: newMessage,
    });
    setNewMessage('');
    socket.emit('stopTyping', { chatId });
  };

  const openConfirm = (id: string) => setPendingId(id);
  const confirmDelete = () => {
    if (pendingId && socket) socket.emit('deleteMessage', { chatId, messageId: pendingId });
    setPendingId(null);
  };

  if (!doctorProfile)
    return <div className="flex h-screen items-center justify-center text-slate-100">Loading…</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex w-80 shrink-0 justify-center bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 flex-col items-center text-center">
        <img
          src={doctorProfile.avatar}
          alt={doctorProfile.name}
          className="w-32 h-32 rounded-full object-cover mb-4 ring-1 ring-white/10"
        />
        <h2 className="text-xl font-semibold">{doctorProfile.name}</h2>
        <p className="text-sm text-slate-400">{doctorProfile.speciality}</p>
        <p
          className={`mt-2 text-xs font-medium ${
            isDoctorOnline ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          {isDoctorOnline ? 'Online' : 'Offline'}
        </p>
      </aside>

      {/* Main Section */}
      <main className="flex flex-col flex-1 h-full">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur ring-1 ring-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <img
            src={doctorProfile.avatar}
            alt="avatar"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-1 ring-white/10"
          />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-100">
              {doctorProfile.name}
            </h3>
            <p
              className={`mt-1 md:mt-2 text-[10px] md:text-xs font-medium ${
                isDoctorOnline ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {isDoctorOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </header>

        {/* Messages Section */}
        <section className="flex-1 overflow-y-auto px-4 md:px-6 py-3 md:py-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.senderRole === 'user';
            return (
              <div key={m._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`relative group flex max-w-[75%] md:max-w-xs items-end space-x-2 ${
                    isUser ? 'flex-row-reverse' : ''
                  }`}
                >
                  {isUser && !m.deleted && (
                    <button
                      onClick={() => openConfirm(m._id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full text-xs
                                 bg-slate-800 hover:bg-red-600 opacity-0
                                 group-hover:opacity-100 transition"
                      title="Delete"
                    >
                      ✕
                    </button>
                  )}

                  {!isUser && (
                    <img
                      src={doctorProfile.avatar}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-3 md:px-4 py-2 rounded-2xl text-sm ${
                      isUser
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-white/10 ring-1 ring-white/10 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {m.deleted ? (
                      <em className="text-[10px] md:text-xs text-slate-400">message removed</em>
                    ) : m.kind === 'text' || m.kind === 'emoji' ? (
                      <p className="break-words">{m.text}</p>
                    ) : m.kind === 'image' ? (
                      <img src={m.mediaUrl} className="max-w-[150px] md:max-w-[200px] rounded" />
                    ) : (
                      <a
                        href={m.mediaUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <svg
                          className="w-5 h-5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v4h4M16 20H8a2 2 0 01-2-2V6a2 2 0 012-2h6l4 4v10a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="max-w-[100px] md:max-w-[140px] truncate">
                          {fileName(m.mediaUrl!)}
                        </span>
                      </a>
                    )}

                    <p
                      className={`text-[9px] md:text-[10px] mt-1 ${
                        isUser ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {timeOf(m.createdAt)}{' '}
                      {isUser && (m.readBy?.length ? '✓✓' : m.deliveredTo?.length ? '✓' : '')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && <p className="text-xs text-slate-400 italic">Doctor is typing…</p>}

          <div ref={messagesEndRef} />
        </section>

        {/* Input Form */}
        <form
          onSubmit={send}
          className="bg-white/5 backdrop-blur ring-1 ring-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3"
        >
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPickedFile(f);
                setPreviewUrl(URL.createObjectURL(f));
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-white/10 transition"
            title="Attach file"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79V8a5 5 0 00-9.9-1M3 12.79V17a5 5 0 009.9 1"
              />
            </svg>
          </button>

          {pickedFile && (
            <div className="flex items-center gap-2 bg-white/10 px-2 md:px-3 py-1 rounded-full">
              {pickedFile.type.startsWith('image/') ? (
                <img
                  src={previewUrl!}
                  alt={pickedFile.name}
                  className="w-6 h-6 md:w-8 md:h-8 rounded object-cover"
                />
              ) : (
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a4.5 4.5 0 010 6.364l-7.071 7.071a3 3 0 01-4.243-4.243L12.5 9.5"
                  />
                </svg>
              )}
              <span className="max-w-[90px] md:max-w-[120px] truncate text-[10px] md:text-xs">
                {pickedFile.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPickedFile(null);
                  clearFileInput();
                }}
                className="text-slate-400 hover:text-red-400 text-base leading-none"
              >
                &times;
              </button>
            </div>
          )}

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => socket?.emit('typing', { chatId })}
            onBlur={() => socket?.emit('stopTyping', { chatId })}
            placeholder="Type a message…"
            className="flex-1 bg-transparent ring-1 ring-white/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() && !pickedFile}
            className="p-2.5 md:p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 hover:-translate-y-0.5 transition-transform"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </main>

      {/* Delete Confirm Modal */}
      {pendingId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPendingId(null)}
          />
          <div className="relative z-50 w-full max-w-xs md:max-w-sm rounded-2xl bg-slate-900 p-5 md:p-6 text-center ring-1 ring-white/10 shadow-2xl">
            <h4 className="mb-3 md:mb-4 text-base md:text-lg font-semibold text-slate-100">
              Delete message?
            </h4>
            <p className="mb-4 md:mb-6 text-xs md:text-sm text-slate-400">
              This will remove the message for everyone.
            </p>
            <div className="flex justify-center gap-3 md:gap-4">
              <button
                onClick={() => setPendingId(null)}
                className="px-3 md:px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs md:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 md:px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
