import { api } from "../axios/axiosInstance";          
import { doctorApi } from "../axios/doctorAxiosInstance";
import { CHAT_API } from "../constants/apiRoutes";

export const userChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    api.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) => api.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    api.patch(CHAT_API.MARK_READ(chatId), { userId }),
};

export const doctorChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    doctorApi.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) =>
    doctorApi.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    doctorApi.patch(CHAT_API.MARK_READ(chatId), { userId }),
};


export const uploadChatFile = async (file: File) => {           
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await api.post("/api/chat/upload", fd, {     
    headers: { "Content-Type": "multipart/form‑data" },         
  });                                                           

  if (!data.success) throw new Error("upload failed");          
  return { url: data.url as string, mime: data.mime as string } 
}; 


export const getPresence = (id: string) =>                      
  api.get<{ online: boolean }>(`/api/presence/${id}`);  


