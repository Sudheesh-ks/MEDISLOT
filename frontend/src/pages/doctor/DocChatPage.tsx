import React, { useState, useRef, useEffect, useContext } from "react";
import io, { Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { getUserByIDAPI } from "../../services/userProfileServices";
import {
  doctorChat,
  getPresence,
  uploadChatFile,
} from "../../services/chatService";
import type { Message } from "../../types/message";
import { NotifContext } from "../../context/NotificationContext";

const SOCKET_URL = "http://localhost:4000";
const timeOf = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

const fileName = (url: string) => url.split("/").pop()?.split("?")[0] ?? "file";

const DocChatPage: React.FC = () => {
  const ctx = useContext(DoctorContext);
  const notif = useContext(NotifContext);
  if (!ctx) throw new Error("DoctorContext missing");
  const doctorId = ctx.profileData?._id ?? null;
  const { userId } = useParams<"userId">();
  const chatId = doctorId && userId ? `${userId}_${doctorId}` : "";

  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatar: string;
    email?: string;
    isOnline?: boolean;
    lastSeen?: string;
  } | null>(null);

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  useEffect(() => {
    if (!doctorId) return;
    const s = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId: doctorId, role: "doctor" },
    });
    socketRef.current = s;
    return () => {
      s.disconnect();
    };
  }, [doctorId]);

  useEffect(() => {
    if (!userId) return;
    getUserByIDAPI(userId).then(({ data }) => {
      if (data.success) {
        setUserProfile({
          name: data.user.name,
          avatar: data.user.image || "/placeholder-avatar.png",
          email: data.user.email,
        });
      }
    });
    getPresence(userId).then((r) => setIsUserOnline(r.data.online));
  }, [userId]);

  useEffect(() => {
    if (!doctorId) return;
    const s = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId: doctorId, role: "doctor" },
    });
    socketRef.current = s;

    s.on(
      "presence",
      ({ userId: id, online }: { userId: string; online: boolean }) => {
        if (id === userId) setIsUserOnline(online);
      }
    );

    return () => {
      s.off("presence");
      s.disconnect();
    };
  }, [doctorId, userId]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !chatId) return;

    s.emit("join", chatId);

    const onPresence = (p: { userId: string; online: boolean }) => {
      if (p.userId === userId) {
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                isOnline: p.online,
                lastSeen: !p.online
                  ? timeOf(new Date().toISOString())
                  : prev.lastSeen,
              }
            : prev
        );
      }
    };
    s.on("presence", onPresence);
    doctorChat.fetchHistory(chatId).then(({ data }) => {
      if (data.success) setMessages(data.messages);
    });

    const receive = (m: Message) => setMessages((p) => [...p, m]);
    const delivered = (d: any) =>
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
    const readBy = (d: any) =>
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

    const onDeleted = (d: { messageId: string }) =>
      setMessages((p) =>
        p.map((m) => (m._id === d.messageId ? { ...m, deleted: true } : m))
      );

    s.on("receiveMessage", receive);
    s.on("delivered", delivered);
    s.on("readBy", readBy);
    s.on("messageDeleted", onDeleted);
    s.on("typing", () => setIsTyping(true));
    s.on("stopTyping", () => setIsTyping(false));

    return () => {
      s.off("receiveMessage", receive);
      s.off("presence", onPresence);
      s.off("delivered", delivered);
      s.off("readBy", readBy);
      s.off("messageDeleted", onDeleted);
      s.off("typing");
      s.off("stopTyping");
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatId) socketRef.current?.emit("read", { chatId });
    notif?.markRead?.(chatId);
  }, [chatId]);

  const send = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!chatId) return;

    if (pickedFile) {
      try {
        const { url, mime } = await uploadChatFile(pickedFile);
        socketRef.current?.emit("sendMessage", {
          chatId,
          receiverId: userId,
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
    socketRef.current?.emit("sendMessage", {
      chatId,
      receiverId: userId,
      kind: "text",
      text: newMessage,
    });
    setNewMessage("");
    socketRef.current?.emit("stopTyping", { chatId });
  };

  const openConfirm = (id: string) => setPendingId(id);
  const confirmDelete = () => {
    if (pendingId && socketRef.current)
      socketRef.current.emit("deleteMessage", { chatId, messageId: pendingId });
    setPendingId(null);
  };

  if (!doctorId || !userProfile)
    return (
      <div className="flex h-screen items-center justify-center text-slate-200">
        Loading…
      </div>
    );

  const glass = "bg-white/5 backdrop-blur ring-1 ring-white/10";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside
        className={`w-80 shrink-0 ${glass} justify-center p-6 flex flex-col items-center text-center`}
      >
        <img
          src={userProfile.avatar}
          className="w-32 h-32 rounded-full object-cover shadow mb-4"
        />
        <h2 className="text-xl font-semibold">{userProfile.name}</h2>
        <p className="text-sm text-slate-400">{userProfile.email}</p>
        <p
          className={`mt-2 text-xs font-medium ${
            isUserOnline ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {" "}
          {/* ⭐ CHANGED */}
          {isUserOnline ? "Online" : "Offline"} {/* ⭐ CHANGED */}
        </p>
      </aside>

      {/* ---------- CHAT PANEL ---------- */}
      <main className="flex flex-col flex-1 h-full">
        {/* header */}
        <header
          className={`${glass} border-b border-white/10 px-6 py-4 flex items-center gap-3`}
        >
          <img
            src={userProfile.avatar}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold">{userProfile.name}</h3>
            <p
              className={`mt-2 text-xs font-medium ${
                isUserOnline ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {" "}
              {/* ⭐ CHANGED */}
              {isUserOnline ? "Online" : "Offline"} {/* ⭐ CHANGED */}
            </p>
          </div>
        </header>

        {/* messages list */}
        <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((m) => {
            const isDoc = m.senderRole === "doctor";
            return (
              <div
                key={m._id}
                className={`flex ${isDoc ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative group flex max-w-xs items-end space-x-2 ${
                    isDoc ? "flex-row-reverse" : ""
                  }`}
                >
                  {isDoc && !m.deleted && (
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
                  {!isDoc && (
                    <img
                      src={userProfile.avatar}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isDoc
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : `${glass} rounded-bl-none`
                    }`}
                  >
                    {m.deleted ? (
                      <em className="text-xs text-slate-400">
                        message removed
                      </em>
                    ) : m.kind === "text" || m.kind === "emoji" ? (
                      <p className="break-words">{m.text}</p>
                    ) : m.kind === "image" ? (
                      <img
                        src={m.mediaUrl!}
                        className="max-w-[200px] rounded"
                      />
                    ) : (
                      <a
                        href={m.mediaUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline text-sm"
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

                    <p className="text-[10px] mt-1 text-slate-400">
                      {timeOf(m.createdAt)}{" "}
                      {isDoc &&
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
            <div className="flex items-center gap-2 text-sm text-slate-400 italic">
              <span className="animate-pulse">…</span> User is typing
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        <form
          onSubmit={send}
          className={`${glass} border-t border-white/10 px-6 py-4 flex items-center gap-3`}
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
              strokeWidth="2"
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
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              {pickedFile.type.startsWith("image/") ? (
                <img
                  src={previewUrl!}
                  alt={pickedFile.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
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

          <input
            className="flex-1 bg-transparent ring-1 ring-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => socketRef.current?.emit("typing", { chatId })}
            onBlur={() => socketRef.current?.emit("stopTyping", { chatId })}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && !pickedFile}
            className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 disabled:opacity-40 hover:-translate-y-0.5 transition-transform"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </main>
      {pendingId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPendingId(null)}
          />
          <div className="relative z-50 w-72 rounded-2xl bg-slate-900 p-6 text-center ring-1 ring-white/10 shadow-2xl">
            <h4 className="mb-4 text-lg font-semibold text-slate-100">
              Delete message?
            </h4>
            <p className="mb-6 text-sm text-slate-400">
              This will remove the message for everyone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPendingId(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
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

export default DocChatPage;
