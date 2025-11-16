import { doctorApi, userApi } from '../axios/axiosInstance';
import { CHAT_API } from '../constants/apiRoutes';

export const userChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    userApi.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) => userApi.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    userApi.patch(CHAT_API.MARK_READ(chatId), { userId }),
};

export const doctorChat = {
  fetchHistory: (chatId: string, limit = 1000, before?: string) =>
    doctorApi.get(CHAT_API.HISTORY(chatId), { params: { limit, before } }),

  deleteMessage: (id: string) => doctorApi.delete(CHAT_API.DELETE_MESSAGE(id)),

  markRead: (chatId: string, userId: string) =>
    doctorApi.patch(CHAT_API.MARK_READ(chatId), { userId }),
};

export const uploadChatFile = async (file: File) => {
  const fd = new FormData();
  fd.append('file', file);

  const { data } = await userApi.post(CHAT_API.UPLOAD, fd, {
    headers: { 'Content-Type': 'multipart/form‑data' },
  });

  if (!data.success) throw new Error('upload failed');
  return { url: data.url as string, mime: data.mime as string };
};

export const getPresence = (id: string) => userApi.get<{ online: boolean }>(CHAT_API.PRESENCE(id));
