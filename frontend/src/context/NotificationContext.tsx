import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { AppContext }    from "./AppContext";
import { DoctorContext } from "./DoctorContext";
import { AdminContext }  from "./AdminContext";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

/* ──────────────────────────────────────────────────────────── */
/* helpers & types                                              */
/* ──────────────────────────────────────────────────────────── */

type UnreadMap = Record<string, number>;

export interface NotifCtx {
  unread: UnreadMap;
  inc: (chatId: string) => void;
  markRead: (chatId: string) => void;
  socket: Socket | null;
  myRole: "user" | "doctor" | "admin";
}

export const NotifContext = createContext<NotifCtx>({
  unread: {},
  inc: () => {},
  markRead: () => {},
  socket: null,
  myRole: "user",
});

const storageKeyFor = (role: string, id?: string | null) =>
  id ? `unread_${role}_${id}` : null;

/* ──────────────────────────────────────────────────────────── */
/* provider                                                     */
/* ──────────────────────────────────────────────────────────── */
export const NotifProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  /* who am I? — now based on URL first                        */
  const { pathname } = useLocation();

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isAdminRoute  = pathname.startsWith("/admin");

  const { userData   } = useContext(AppContext)!;
  const { profileData } = useContext(DoctorContext)!;
  const { dashData    } = useContext(AdminContext)!;

  const myRole: "user" | "doctor" | "admin" = isAdminRoute
    ? "admin"
    : isDoctorRoute
    ? "doctor"
    : "user";

  /* match ID purely to the route we’re on                     */
  const myId =
    myRole === "user"
      ? userData?._id
      : myRole === "doctor"
      ? profileData?._id
      : dashData?._id; // admin

  /* unread badge state                                        */
  const [unread, setUnread] = useState<UnreadMap>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  const storageKey = useMemo(
    () => storageKeyFor(myRole, myId),
    [myRole, myId],
  );

  /* ── load persisted map once ─────────────────────────────── */
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

  /* ── save on every change ───────────────────────────────── */
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(unread));
    }
  }, [storageKey, unread]);

  /* ── inc / markRead helpers ─────────────────────────────── */
  const inc = useCallback((chatId: string) => {
    setUnread((u) => ({ ...u, [chatId]: (u[chatId] ?? 0) + 1 }));
  }, []);

  const markRead = useCallback((chatId: string) => {
    setUnread((u) => {
      const { [chatId]: _omit, ...rest } = u;
      return rest;
    });
  }, []);

  /* ── socket life‑cycle ──────────────────────────────────── */
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
      /* ignore if sender is me or same role, or I’m admin */
      if (myRole === "admin") return;
      if (p.from.id === myId)  return;
      if (p.from.role === myRole) return;
      inc(p.chatId);
    };

    s.on("dmNotice", onDm);

    return () => {
      s.off("dmNotice", onDm);
      s.disconnect();
      setSocket(null);
    };
  }, [myId, myRole, inc]);

  /* ── expose context ─────────────────────────────────────── */
  return (
    <NotifContext.Provider
      value={{ unread, inc, markRead, socket, myRole }}
    >
      {children}
    </NotifContext.Provider>
  );
};
