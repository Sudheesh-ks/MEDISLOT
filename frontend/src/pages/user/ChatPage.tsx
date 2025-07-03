// src/pages/user/ChatPage.tsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { NotifContext } from "../../context/NotificationContext";
import { getDoctorsByIDAPI } from "../../services/doctorServices";
import {
  getPresence,
  uploadChatFile,
  userChat,
} from "../../services/chatService";
import type { Message } from "../../types/message";


/* ---------- small helpers ---------- */
const timeOf = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

const fileName = (url: string) =>
  url.split("/").pop()?.split("?")[0] ?? "file";

/* ============================================================= */

const ChatPage: React.FC = () => {
  /* contexts */
  const { userData } = useContext(AppContext)!;
  const { socket, markRead } = useContext(NotifContext);

  /* route params */
  const { doctorId } = useParams<{ doctorId: string }>();

  /* IDs */
  const userId = userData?._id;
  const chatId = `${userId}_${doctorId}`;

  /* ---------------- state ---------------- */
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDoctorOnline, setIsDoctorOnline] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doctorProfile, setDoctorProfile] = useState<{
    name: string;
    avatar: string;
    speciality: string;
    isOnline?: boolean;
  } | null>(null);

  /* ---------- helper to clear file input ---------- */
  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  /* ---------- load doctor once ---------- */
  useEffect(() => {
    if (!doctorId) return;

    getDoctorsByIDAPI(doctorId).then(({ data }) => {
      if (data.success) {
        setDoctorProfile({
          name: data.doctor.name,
          avatar: data.doctor.image || "/placeholder.png",
          speciality: data.doctor.speciality,
        });
      }
    });

    getPresence(doctorId).then((r) => setIsDoctorOnline(r.data.online));
  }, [doctorId]);

  /* ---------- live presence updates ---------- */
  useEffect(() => {
    if (!socket) return;

    const onPresence = ({
      userId: id,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      if (id === doctorId) setIsDoctorOnline(online);
    };

    socket.on("presence", onPresence);
    return () => { socket.off("presence", onPresence); }
  }, [socket, doctorId]);

  /* ---------- join room, history, listeners ---------- */
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("join", chatId);
    markRead(chatId);
    socket.emit("read", { chatId });

    userChat
      .fetchHistory(chatId)
      .then(({ data }) => data.success && setMessages(data.messages));

    const onReceive = (m: Message) => setMessages((p) => [...p, m]);
    const onDelivered = (d: any) =>
      setMessages((p) =>
        p.map((m) =>
          m._id === d.messageId
            ? {
                ...m,
                deliveredTo: [
                  ...(m.deliveredTo ?? []),
                  { userId: d.userId, at: d.at },
                ],
              }
            : m
        )
      );
    const onReadBy = (d: any) =>
      setMessages((p) =>
        p.map((m) =>
          m.chatId === d.chatId
            ? {
                ...m,
                readBy: [
                  ...(m.readBy ?? []),
                  { userId: d.userId, at: d.at },
                ],
              }
            : m
        )
      );
    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);

    socket.on("receiveMessage", onReceive);
    socket.on("delivered", onDelivered);
    socket.on("readBy", onReadBy);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("delivered", onDelivered);
      socket.off("readBy", onReadBy);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [socket, chatId, doctorId, markRead]);

  /* autoscroll to newest msg */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- send handler ---------- */
  const send = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!socket) return;

    if (pickedFile) {
      try {
        const { url, mime } = await uploadChatFile(pickedFile);
        socket.emit("sendMessage", {
          chatId,
          receiverId: doctorId,
          kind: mime.startsWith("image/") ? "image" : "file",
          mediaUrl: url,
          mediaType: mime,
        });
        setPickedFile(null);
        clearFileInput();
      } catch (err) {
        console.error("upload failed", err);
      }
      return;
    }

    if (!newMessage.trim()) return;
    socket.emit("sendMessage", {
      chatId,
      receiverId: doctorId,
      kind: "text",
      text: newMessage,
    });
    setNewMessage("");
    socket.emit("stopTyping", { chatId });
  };

  /* ---------- render ---------- */
  if (!doctorProfile)
    return (
      <div className="flex h-screen items-center justify-center text-slate-100">
        Loading…
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* ====== Sidebar ====== */}
      <aside className="w-80 shrink-0 justify-center bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 flex flex-col items-center text-center">
        <img
          src={doctorProfile.avatar}
          alt={doctorProfile.name}
          className="w-32 h-32 rounded-full object-cover mb-4 ring-1 ring-white/10"
        />
        <h2 className="text-xl font-semibold">{doctorProfile.name}</h2>
        <p className="text-sm text-slate-400">{doctorProfile.speciality}</p>
        <p
          className={`mt-2 text-xs font-medium ${
            isDoctorOnline ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {isDoctorOnline ? "Online" : "Offline"}
        </p>
      </aside>

      {/* ====== Chat pane ====== */}
      <main className="flex flex-col flex-1 h-full">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur ring-1 ring-white/10 px-6 py-4 flex items-center gap-3">
          <img
            src={doctorProfile.avatar}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              {doctorProfile.name}
            </h3>
            <p
              className={`mt-2 text-xs font-medium ${
                isDoctorOnline ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {isDoctorOnline ? "Online" : "Offline"}
            </p>
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.senderRole === "user";
            return (
              <div
                key={m._id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-xs items-end space-x-2 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                >
                  {!isUser && (
                    <img
                      src={doctorProfile.avatar}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isUser
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-white/10 ring-1 ring-white/10 text-slate-100 rounded-bl-none"
                    }`}
                  >
                    {/* bubble content */}
                    {m.deleted ? (
                      <em className="text-xs text-slate-400">message removed</em>
                    ) : m.kind === "text" || m.kind === "emoji" ? (
                      <p className="break-words">{m.text}</p>
                    ) : m.kind === "image" ? (
                      <img src={m.mediaUrl!} className="max-w-[200px] rounded" />
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
                        <span className="max-w-[140px] truncate">
                          {fileName(m.mediaUrl!)}
                        </span>
                      </a>
                    )}

                    {/* time + ticks */}
                    <p
                      className={`text-[10px] mt-1 ${
                        isUser ? "text-slate-200" : "text-slate-400"
                      }`}
                    >
                      {timeOf(m.createdAt)}{" "}
                      {isUser &&
                        (m.readBy?.length
                          ? "✓✓"
                          : m.deliveredTo?.length
                          ? "✓"
                          : "")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <p className="text-xs text-slate-400 italic">
              Doctor is typing…
            </p>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Input */}
        <form
          onSubmit={send}
          className="bg-white/5 backdrop-blur ring-1 ring-white/10 px-6 py-4 flex items-center gap-3"
        >
          {/* hidden file input */}
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

          {/* attach button */}
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

          {/* preview chip */}
          {pickedFile && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              {pickedFile.type.startsWith("image/") ? (
                <img
                  src={previewUrl!}
                  alt={pickedFile.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636a4.5 4.5 0 010 6.364l-7.071 7.071a3 3 0 01-4.243-4.243L12.5 9.5"
                  />
                </svg>
              )}
              <span className="max-w-[120px] truncate text-xs">
                {pickedFile.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPickedFile(null);
                  clearFileInput();
                }}
                className="text-slate-400 hover:text-red-400 text-lg leading-none"
              >
                &times;
              </button>
            </div>
          )}

          {/* text input */}
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => socket?.emit("typing", { chatId })}
            onBlur={() => socket?.emit("stopTyping", { chatId })}
            placeholder="Type a message…"
            className="flex-1 bg-transparent ring-1 ring-white/10 rounded-full px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          {/* send button */}
          <button
            type="submit"
            disabled={!newMessage.trim() && !pickedFile}
            className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 disabled:opacity-40 hover:-translate-y-0.5 transition-transform"
          >
            <svg
              className="w-5 h-5"
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
    </div>
  );
};

export default ChatPage;
