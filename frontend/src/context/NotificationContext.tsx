import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

import { AppContext } from './AppContext';
import { DoctorContext } from './DoctorContext';
import { AdminContext } from './AdminContext';


const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

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

const storageKeyFor = (id?: string | null) => (id ? `unread_${id}` : null);

export const NotifProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { pathname } = useLocation();

  const { userData } = useContext(AppContext)!;
  const { profileData } = useContext(DoctorContext);
  const { dashData } = useContext(AdminContext)!;

  const isDoctorRoute = pathname.startsWith('/doctor');
  const isAdminRoute = pathname.startsWith('/admin');

  const myRole: 'user' | 'doctor' | 'admin' = isAdminRoute
    ? 'admin'
    : isDoctorRoute
    ? 'doctor'
    : 'user';

  const myId =
    myRole === 'user'
      ? userData?._id
      : myRole === 'doctor'
      ? profileData?._id
      : dashData?._id;

  const [unread, setUnread] = useState<UnreadMap>({});
                        
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
    (chatId: string) =>
      setUnread((u) => ({ ...u, [chatId]: (u[chatId] ?? 0) + 1 })),
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

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!myId) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId: myId, role: myRole },
    });
    setSocket(s);

    const onDm = (p: {
      chatId: string;
      from: { id: string; role: string };
      preview: string;
    }) => {
      if (myRole === 'admin') return;
      if (p.from.id === myId) return;
      if (p.from.role === myRole) return;

      inc(p.chatId);

      const viewing = matchPath({ path: '**/chat/:cid' }, pathname)?.params.cid;
      if (viewing === p.chatId) return;

      toast.info('💬  You have a new message', { autoClose: 3500 });
    };

    s.on('dmNotice', onDm);

    return () => {
      s.off('dmNotice', onDm);
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
