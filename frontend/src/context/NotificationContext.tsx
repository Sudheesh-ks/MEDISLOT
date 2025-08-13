import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

type UnreadMap = Record<string, number>;

export interface NotifCtx {
  unread: UnreadMap;
  inc: (chatId: string) => void;
  markRead: (chatId: string) => void;
  socket: Socket | null;
  myRole: 'user' | 'doctor' | 'admin';
}

export const NotifContext = createContext<NotifCtx>({
  unread: {},
  inc: () => {},
  markRead: () => {},
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
  const [socket, setSocket] = useState<Socket | null>(null);

  const storageKey = useMemo(() => storageKeyFor(myId), [myId]);

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

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(unread));
    }
  }, [storageKey, unread]);

  const inc = useCallback(
    (chatId: string) => setUnread((u) => ({ ...u, [chatId]: (u[chatId] ?? 0) + 1 })),
    []
  );

  const markRead = useCallback(
    (chatId: string) =>
      setUnread((u) => {
        const { [chatId]: _omit, ...rest } = u;
        return rest;
      }),
    []
  );

  useEffect(() => {
    if (!myId) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId: myId, role: myRole },
    });
    setSocket(s);

    const onDm = (p: { chatId: string; from: { id: string; role: string }; preview: string }) => {
      if (myRole === 'admin') return;
      if (p.from.id === myId) return;
      if (p.from.role === myRole) return;

      inc(p.chatId);

      const viewing = matchPath({ path: '**/chat/:cid' }, pathname)?.params.cid;
      if (viewing === p.chatId) return;

      toast.info('💬  You have a new message', { autoClose: 3500 });
    };


      const onNotification = (data: { title: string; message: string; link?: string }) => {
    toast.info(`${data.title}`, {
      position: 'top-right',
      autoClose: 5000,
    });
  };

    s.on('dmNotice', onDm);
    s.on('notification', onNotification);

    return () => {
      s.off('dmNotice', onDm);
      s.off('notification', onNotification);
      s.disconnect();
      setSocket(null);
    };
  }, [myId, myRole, pathname, inc]);

  return (
    <NotifContext.Provider value={{ unread, inc, markRead, socket, myRole }}>
      {children}
    </NotifContext.Provider>
  );
};
