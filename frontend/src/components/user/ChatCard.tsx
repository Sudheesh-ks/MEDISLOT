import { assets } from '../../assets/user/assets';
import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NotifContext } from '../../context/NotificationContext';

type ChatCardProps = { doctorId?: string };

const ChatCard: React.FC<ChatCardProps> = ({ doctorId }) => {
  const nav = useNavigate();
  const { userData } = useContext(AppContext)!;
  const { unread } = useContext(NotifContext);
  const chatKey =
    userData?._id && doctorId ? `${userData._id}_${doctorId}` : '';
  const unreadCount = chatKey ? unread[chatKey] ?? 0 : 0;
  return (
    <div className="flex flex-col bg-white/5 backdrop-blur ring-1 ring-white/10 rounded-3xl overflow-hidden h-full">
      <div className="h-72 overflow-hidden">
        <img
          src={assets.contact_image}
          alt="Chat cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
            Start Messaging
            <img src={assets.message_icon} alt="msg" className="h-5 w-5" />
          </h3>
          <p className="text-sm text-slate-400">
            You have some new messages from the doctor.
          </p>
        </div>

        <button
          onClick={() => nav(`/chats/${doctorId}`)}
          className="relative mt-6 w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white py-3 rounded-full hover:-translate-y-0.5 transition-transform"
        >
          Message
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 min-w-[20px] px-1 bg-red-500 text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
export default ChatCard;
