// src/services/chatService.ts
import { api } from "../axios/axiosInstance";          // rename if you store elsewhere
import { doctorApi } from "../axios/doctorAxiosInstance";
import { CHAT_API } from "../constants/apiRoutes";

/* ===== user side ===== */
export const userChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    api.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) => api.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    api.patch(CHAT_API.MARK_READ(chatId), { userId }),
};

/* ===== doctor side ===== */
export const doctorChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    doctorApi.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) =>
    doctorApi.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    doctorApi.patch(CHAT_API.MARK_READ(chatId), { userId }),
};


// src/services/chatService.ts
export const uploadChatFile = async (file: File) => {           // ✨ NEW
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.post("/api/chat/upload", fd, {     // ✨ NEW
    headers: { "Content-Type": "multipart/form‑data" },         // ✨ NEW
  });                                                           // ✨ NEW

  if (!data.success) throw new Error("upload failed");          // ✨ NEW
  return { url: data.url as string, mime: data.mime as string } // ✨ NEW
}; 


export const getPresence = (id: string) =>                       // ⭐ NEW
  api.get<{ online: boolean }>(`/api/presence/${id}`);  


