import React, { useState, useRef, useEffect, useContext } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  senderRole: "user" | "doctor";
  message: string;
  createdAt?: string;
  mediaUrl?: string;
  mediaType?: string;
}

const SOCKET_URL = "http://localhost:4000";
const socket = io(SOCKET_URL, { withCredentials: true });

const ChatPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext is missing");

  const { userData } = context;
  const { doctorId } = useParams<{ doctorId: string }>();
  const userId = userData?._id;

  const chatId = `${userId}_${doctorId}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (iso?: string): string => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!chatId) return;
    socket.emit("join", chatId);

    fetch(`/api/chat/${chatId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.messages);
      });

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [chatId]);

  const handleSendMessage = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !doctorId) return;

    const msg = {
      chatId,
      senderId: userId,
      receiverId: doctorId,
      senderRole: "user",
      message: newMessage,
    };

    socket.emit("sendMessage", msg);
    setNewMessage("");
    socket.emit("stopTyping", { chatId, senderId: userId });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 shadow border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Chat with Doctor</h2>
          <p className="text-sm text-gray-500">Chat ID: {chatId}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.senderRole === "user";
          return (
            <div key={msg._id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{msg.message}</p>
                <p className="text-xs mt-1 text-right opacity-70">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="text-sm text-gray-500 italic">Doctor is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t px-4 py-3 flex gap-2 items-center"
      >
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => socket.emit("typing", { chatId, senderId: userId })}
          onBlur={() => socket.emit("stopTyping", { chatId, senderId: userId })}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
