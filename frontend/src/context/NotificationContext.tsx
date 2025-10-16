import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { getUserUnreadCountAPI } from '../services/userProfileServices';
import { getDoctorUnreadCountAPI } from '../services/doctorServices';
import { getAdminUnreadCountAPI } from '../services/adminServices';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

type UnreadMap = Record<string, number>;

export interface NotifCtx {
  // Chat
  unread: UnreadMap;
  inc: (chatId: string) => void;
  markRead: (chatId: string) => void;

  // Notifications
  notifUnreadCount: number;
  setNotifUnreadCount: React.Dispatch<React.SetStateAction<number>>;

  socket: Socket | null;
  myRole: 'user' | 'doctor' | 'admin';
}

export const NotifContext = createContext<NotifCtx>({
  unread: {},
  inc: () => {},
  markRead: () => {},
  notifUnreadCount: 0,
  setNotifUnreadCount: () => {},
  socket: null,
  myRole: 'user',
});

interface NotifProviderProps {
  children: React.ReactNode;
  currentUser: { _id?: string } | null;
}

const storageKeyFor = (id?: string | null) => (id ? `unread_${id}` : null);

export const NotifProvider: React.FC<NotifProviderProps> = ({ children, currentUser }) => {
  const { pathname } = useLocation();

  const myRole: 'user' | 'doctor' | 'admin' = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/doctor')
      ? 'doctor'
      : 'user';

  const myId = currentUser?._id ?? null;

  const [unread, setUnread] = useState<UnreadMap>({});
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const storageKey = useMemo(() => storageKeyFor(myId), [myId]);

  // Load chat unread from localStorage
  useEffect(() => {
    if (!storageKey) {
      setUnread({});
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      setUnread(raw ? JSON.parse(raw) : {});
    } catch {
      setUnread({});
    }
  }, [storageKey]);

  // Save chat unread to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(unread));
    }
  }, [storageKey, unread]);

  // Chat helpers
  const inc = useCallback(
    (chatId: string) => setUnread((u) => ({ ...u, [chatId]: (u[chatId] ?? 0) + 1 })),
    []
  );

  const markRead = useCallback(
    (chatId: string) =>
      setUnread((u) => {
        const { [chatId]: _, ...rest } = u;
        return rest;
      }),
    []
  );

  // Notification API's
  useEffect(() => {
    if (!myId) return;

    const fetchInitialUnread = async () => {
      try {
        let count = 0;
        if (myRole === 'user') {
          const res = await getUserUnreadCountAPI();
          count = res.unreadCount;
        } else if (myRole === 'doctor') {
          const res = await getDoctorUnreadCountAPI();
          count = res.unreadCount;
        } else if (myRole === 'admin') {
          const res = await getAdminUnreadCountAPI();
          count = res.unreadCount;
        }
        setNotifUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch initial unread notifications', err);
      }
    };

    fetchInitialUnread();
  }, [myId, myRole]);

  // Socket connection
  useEffect(() => {
    if (!myId) return;

    const s = io(BACKEND_URL, {
      withCredentials: true,
      auth: { userId: myId, role: myRole },
      transports: ['websocket'],
    });
    setSocket(s);

    // Chat events
    const onDm = (p: { chatId: string; from: { id: string; role: string }; preview: string }) => {
      if (myRole === 'admin') return;
      if (p.from.id === myId) return;
      if (p.from.role === myRole) return;

      inc(p.chatId);

      const viewing = matchPath({ path: '**/chat/:cid' }, pathname)?.params.cid;
      if (viewing === p.chatId) return;

      toast.info('💬 You have a new chat message', { autoClose: 3500 });
    };

    // Notification events
    const onNotifCount = (data: { unreadCount: number }) => {
      setNotifUnreadCount(data.unreadCount);
    };

    const onNotif = (data: { title: string; message: string }) => {
      setNotifUnreadCount((prev) => prev + 1);
      toast.info(`${data.title}: ${data.message}`);
    };

    s.on('dmNotice', onDm);
    s.on('notificationCountUpdate', onNotifCount);
    s.on('newNotification', onNotif);

    return () => {
      s.off('dmNotice', onDm);
      s.off('notificationCountUpdate', onNotifCount);
      s.off('newNotification', onNotif);
      s.disconnect();
      setSocket(null);
    };
  }, [myId, myRole, pathname, inc]);

  return (
    <NotifContext.Provider
      value={{ unread, inc, markRead, notifUnreadCount, setNotifUnreadCount, socket, myRole }}
    >
      {children}
    </NotifContext.Provider>
  );
};
