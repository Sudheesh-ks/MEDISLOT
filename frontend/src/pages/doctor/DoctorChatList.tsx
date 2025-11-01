import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  // MoreVertical,
  MessageCircle,
  // Camera,
  Users,
  Clock,
  ActivitySquareIcon,
} from 'lucide-react';
import { getDoctorAppointmentsAPI } from '../../services/doctorServices';
import { doctorChat } from '../../services/chatService';
import { DoctorContext } from '../../context/DoctorContext';
import { NotifContext } from '../../context/NotificationContext';
import type { AppointmentTypes } from '../../types/appointment';
import { assets } from '../../assets/user/assets';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  role: string;
  updatedAt: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  isConfirmed: boolean;
}

interface Stat {
  label: string;
  value: number;
  icon: any;
  filterKey: 'all' | 'unread' | 'today' | 'active';
}

const DoctorChatList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'today' | 'active'>('all');
  const navigate = useNavigate();

  const { unread } = useContext(NotifContext);
  const { dToken, profileData } = useContext(DoctorContext);
  const doctorId = profileData?._id;

  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);

  const glass = 'bg-slate-900/50 backdrop-blur border border-slate-800';
  const gradient = 'from-blue-500 to-cyan-500';

  useEffect(() => {
    const fetchChats = async () => {
      if (!doctorId) return;

      try {
        const { data } = await getDoctorAppointmentsAPI();
        if (!data?.success) {
          setChats([]);
          setStats([]);
          return;
        }

        const appts: any[] = (data.appointments ?? []).filter(
          (a: AppointmentTypes) => !a.cancelled
        );

        const latestApptByUser = new Map<string, any>();
        for (const appt of appts) {
          const userId = appt.userData?._id;
          if (!userId) continue;

          const apptTimestamp =
            typeof appt.date === 'number'
              ? appt.date
              : new Date(`${appt.slotDate ?? ''}T${appt.slotStartTime ?? '00:00'}:00`).getTime();

          const existing = latestApptByUser.get(userId);
          if (!existing || (apptTimestamp && apptTimestamp > existing._apptTimestamp)) {
            latestApptByUser.set(userId, { ...appt, _apptTimestamp: apptTimestamp });
          }
        }

        const users = Array.from(latestApptByUser.entries());

        const chatPromises = users.map(async ([userId, appt]) => {
          const chatId = `${userId}_${doctorId}`;
          try {
            const historyRes = await doctorChat.fetchHistory(chatId);
            const messages: any[] = historyRes?.data?.messages ?? [];

            if (!messages.length) return null;

            const lastMsg = messages[messages.length - 1];

            const msgText = lastMsg
              ? lastMsg.deleted
                ? 'message removed'
                : lastMsg.kind === 'text' || lastMsg.kind === 'emoji'
                  ? lastMsg.text
                  : lastMsg.kind === 'image'
                    ? '📷 Image'
                    : '📎 File'
              : 'No messages yet';

            const time = lastMsg?.createdAt
              ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date(appt._apptTimestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

            return {
              id: userId,
              name: appt.userData?.name ?? 'Unknown',
              avatar: appt.userData?.image || assets.default_profile,
              lastMessage: msgText,
              time,
              unreadCount: unread?.[chatId] ?? 0,
              online: appt.userData?.online ?? false,
              role: 'Patient',
              updatedAt: lastMsg?.createdAt ?? new Date(appt._apptTimestamp).toISOString(),
              slotDate: appt.slotDate,
              slotStartTime: appt.slotStartTime,
              slotEndTime: appt.slotEndTime,
              isConfirmed: !!appt.isConfirmed,
            } as Chat;
          } catch (err) {
            console.error('fetchHistory error for', userId, err);
            return null;
          }
        });

        const resolved = await Promise.all(chatPromises);
        const messageChats = resolved.filter(Boolean) as Chat[];

        const patients = messageChats.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setChats(patients);

        const now = new Date();
        const totalPatients = patients.length;
        const patientsWithUnread = patients.filter((c) => c.unreadCount > 0).length;

        const patientIdsWithMessages = new Set(patients.map((p) => p.id));
        const today = new Date();
        const todaysSet = new Set<string>();
        for (const appt of appts) {
          const uid = appt.userData?._id;
          if (!uid || !patientIdsWithMessages.has(uid)) continue;
          const apptDate = new Date(appt.slotDate);
          if (apptDate.toDateString() === today.toDateString()) todaysSet.add(uid);
        }
        const todaysPatientCount = todaysSet.size;

        const activeSet = new Set<string>();
        for (const appt of appts) {
          const uid = appt.userData?._id;
          if (!uid || !patientIdsWithMessages.has(uid)) continue;
          if (!appt.isConfirmed) continue;
          if (!appt.slotDate || !appt.slotEndTime) continue;
          const endTime = new Date(`${appt.slotDate}T${appt.slotEndTime}:00`);
          endTime.setHours(endTime.getHours() + 24);
          if (endTime > now) activeSet.add(uid);
        }
        const uniqueActiveUsers = activeSet.size;

        setStats([
          { label: 'Total Patients', value: totalPatients, icon: Users, filterKey: 'all' },
          {
            label: 'Unread Messages',
            value: patientsWithUnread,
            icon: MessageCircle,
            filterKey: 'unread',
          },
          {
            label: "Today's Consultations",
            value: todaysPatientCount,
            icon: Clock,
            filterKey: 'today',
          },
          {
            label: 'Active Consultations',
            value: uniqueActiveUsers,
            icon: ActivitySquareIcon,
            filterKey: 'active',
          },
        ]);
      } catch (err) {
        console.error('Error fetching doctor chats', err);
      }
    };

    fetchChats();
  }, [doctorId, unread]);

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (chatFilter === 'unread') return matchesSearch && chat.unreadCount > 0;
    if (chatFilter === 'today') {
      const today = new Date();
      const chatDate = new Date(chat.slotDate);
      return matchesSearch && chatDate.toDateString() === today.toDateString();
    }
    if (chatFilter === 'active') {
      const now = new Date();
      const endTime = new Date(`${chat.slotDate}T${chat.slotEndTime}:00`);
      endTime.setHours(endTime.getHours() + 24);
      return matchesSearch && endTime > now && chat.isConfirmed;
    }

    return matchesSearch;
  });

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-cyan-400 to-blue-500',
      'bg-gradient-to-br from-blue-400 to-cyan-500',
      'bg-gradient-to-br from-cyan-500 to-blue-600',
      'bg-gradient-to-br from-blue-500 to-cyan-600',
    ];
    const index = name?.charCodeAt?.(0) ?? 0;
    return colors[index % colors.length];
  };

  if (profileData?.status === 'pending')
    return (
      <div className="m-5 text-center bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-yellow-200 shadow-md">
        <h2 className="text-xl font-semibold mb-2">⏳ Awaiting Approval</h2>
        <p>Your registration is under review. The admin has not approved your account yet.</p>
      </div>
    );
  if (profileData?.status === 'rejected')
    return (
      <div className="m-5 text-center bg-red-900/30 border border-red-600 rounded-xl p-6 text-red-300 shadow-md">
        <h2 className="text-xl font-semibold mb-2">❌ Registration Rejected</h2>
        <p>Your registration has been rejected by the admin.</p>
        <p className="mt-2 text-sm">
          Please contact support or try registering again with updated details.
        </p>
      </div>
    );
  if (profileData?.status !== 'approved') return null;

  return (
    <div className="h-screen bg-slate-950 flex flex-col sm:flex-row overflow-hidden relative text-slate-100">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-cyan-400/8 via-blue-500/8 to-transparent rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-10 sm:right-20 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-400/6 to-cyan-500/6 rounded-full animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-cyan-300/10 rounded-full animate-pulse" />
        <div className="absolute top-40 right-1/3 w-12 sm:w-16 h-12 sm:h-16 bg-blue-400/12 rounded-full animate-bounce" />
        <div className="absolute bottom-1/3 right-6 sm:right-10 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-cyan-300/8 to-blue-400/8 rounded-full animate-pulse" />
      </div>

      {/* Left Section - Stats (hidden on small screens) */}
      <div className="hidden sm:flex flex-1 flex-col relative z-10 p-6 sm:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold shadow-2xl bg-gradient-to-r ${gradient} animate-pulse`}
            >
              💬
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-1 sm:mb-2">Chats</h1>
              <p className="text-sm sm:text-xl text-slate-400">
                Go through the latest messages from patients
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`${glass} p-4 sm:p-6 rounded-2xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-300 group relative overflow-hidden
            ${
              chatFilter === stat.filterKey
                ? 'border-transparent bg-white/5 shadow-lg shadow-cyan-500/20 ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400'
                : 'border-white/10 hover:bg-white/10'
            }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setChatFilter(stat.filterKey)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">{stat.value}</p>
                <p className="text-slate-400 text-xs sm:text-sm">{stat.label}</p>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Chat List */}
      <div
        className={`w-full sm:w-96 ${glass} border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col relative z-10`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold shadow-lg bg-gradient-to-r ${gradient}`}
              >
                💬
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-100">Active Chats</h2>
                <p className="text-xs text-slate-400">{filteredChats.length} conversations</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-3">
          <Camera className="w-5 h-5 cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors" />
        </div> */}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white/10 backdrop-blur text-slate-100 placeholder-slate-400 rounded-xl border border-white/20 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition-all duration-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/doctor/chats/${chat.id}`)}
              className="group relative flex items-center p-3 sm:p-4 hover:bg-white/10 cursor-pointer border-b border-white/5 transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative z-10">
                {chat.avatar ? (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 shadow-lg"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${getAvatarColor(chat.name)} flex items-center justify-center text-white font-semibold text-xs sm:text-sm mr-3 shadow-lg`}
                  >
                    {chat.name?.charAt(0) ?? '?'}
                  </div>
                )}
                {chat.online && (
                  <div className="absolute bottom-0 right-2 sm:right-3 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-cyan-400 to-blue-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-100 truncate text-sm">{chat.name}</h3>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{chat.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300 truncate">{chat.lastMessage}</p>

                  {chat.unreadCount > 0 && (
                    <div
                      className={`bg-gradient-to-r ${gradient} text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2 px-2 shadow-lg`}
                    >
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              No chats yet — message list is empty.
            </div>
          )}
        </div>
      </div>

      <style>{`
    @keyframes fade-in {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
      opacity: 0;
    }
  `}</style>
    </div>
  );
};

export default DoctorChatList;
