import React, { useState, useRef, useEffect } from 'react';
import { getChatHistoryAPI, sendChatMessageAPI } from '../../services/aiChatService';

type Message = { role: 'user' | 'bot'; text: string };

interface ChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBotModal: React.FC<ChatBotModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const data = await getChatHistoryAPI();
          setMessages(data.history || []);
        } catch (err) {
          console.error('Error loading chat history:', err);
          setMessages([]);
        }
      })();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendChatMessageAPI(input);
      const botMessage: Message = { role: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: '⚠️ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () =>
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          }),
        0
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-end md:items-center z-50">
      <div className="w-full md:w-96 h-5/6 md:h-3/4 bg-slate-900 rounded-2xl shadow-2xl p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-blue-400">Chat with your AI Doctor</h2>
          <button className="text-slate-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 bg-slate-800 rounded-xl"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'
                }`}
              >
                {msg.text.split(/(👉 \[.*?\]\(.*?\))/g).map((part, i) => {
                  const match = part.match(/👉 \[(.*?)\]\((.*?)\)/);
                  if (match) {
                    return (
                      <a key={i} href={match[2]} className="text-blue-400 underline ml-1">
                        👉 {match[1]}
                      </a>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </div>
            </div>
          ))}

          {loading && <p className="text-slate-400 text-sm">Typing...</p>}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl px-3 py-2 outline-none bg-slate-800 text-slate-100"
            placeholder="Ask me about health..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotModal;
