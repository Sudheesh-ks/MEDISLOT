import { api } from '../axios/axiosInstance';
import { doctorApi } from '../axios/doctorAxiosInstance';
import { CHAT_API } from '../constants/apiRoutes';

export const sendChatMessageAPI = async (message: string) => {
  const res = await api.post(CHAT_API.SEND, { message });
  return res.data;
};

export const getChatHistoryAPI = async () => {
  const res = await api.get(CHAT_API.CHATBOT_HISTORY);
  return res.data;
};

export const getChatSummaryAPI = async (userId: string) => {
  const res = await doctorApi.get(`/api/chatbot/latest-summary/${userId}`);
  return res.data;
};
