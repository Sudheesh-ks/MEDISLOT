import React from "react";
import { assets } from "../../assets/user/assets";

interface ChatbotButtonProps {
  onClick: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full shadow-2xl hover:shadow-blue-500/40 flex items-center justify-center text-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-110 group z-50 border-2 border-blue-400/30"
    >
      <img src={assets.chatbot_logo} alt="Chatbot" />
      <div className="absolute bottom-full right-0 mb-4 bg-slate-800/95 backdrop-blur-sm text-blue-400 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-2 transition-all duration-300 border border-blue-500/30 shadow-xl">
        Hey!, I'm Your AI Doctor. <br />
        Click here to chat with me.
      </div>
      <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
    </button>
  );
};

export default ChatbotButton;
