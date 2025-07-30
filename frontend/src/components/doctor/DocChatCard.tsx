import { assets } from '../../assets/user/assets';
import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { NotifContext } from '../../context/NotificationContext';
import { DoctorContext } from '../../context/DoctorContext';

type Props = { userId?: string };
const DocChatCard: React.FC<Props> = ({ userId }) => {
  const nav = useNavigate();
  const { unread } = useContext(NotifContext);
  const { profileData } = useContext(DoctorContext);
  const doctorId = profileData?._id;
  const chatKey = userId && doctorId ? `${userId}_${doctorId}` : '';
  const unreadCount = chatKey ? unread[chatKey] ?? 0 : 0;
  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

  return (
    <div className={`w-96 ${glass} rounded-3xl overflow-hidden`}>
      {/* header image */}
      <div className="h-96 overflow-hidden">
        <img
          src={assets.contact_image}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6 space-y-2">
        <h3 className="text-lg font-semibold">Start Messaging</h3>
        <p className="text-slate-400 text-sm">
          Chat with the patient in real‑time.
        </p>
      </div>
      <div className="px-6 pb-6 pt-0">
        <button
          onClick={() => nav(`/doctor/chats/${userId}`)}
          className="relative w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 py-3 rounded-lg font-medium hover:-translate-y-0.5 transition-transform shadow-lg"
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
export default DocChatCard;
