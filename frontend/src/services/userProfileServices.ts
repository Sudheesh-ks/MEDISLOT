import { showErrorToast } from '../utils/errorHandler';
import { USER_PROFILE_API } from '../constants/apiRoutes';
import { userApi } from '../axios/axiosInstance';

// Get user profile
export const getUserProfileAPI = async () => {
  return userApi.get(USER_PROFILE_API.GET);
};

// Update user profile
export const updateUserProfileAPI = async (data: any, image: File | null) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('dob', data.dob);
    formData.append('address[line1]', data.address.line1);
    formData.append('address[line2]', data.address.line2);
    if (image) formData.append('image', image);

    const res = await userApi.put(USER_PROFILE_API.UPDATE, formData);

    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

export const getUserByIDAPI = async (id: string) => {
  return await userApi.get(USER_PROFILE_API.USERBY_ID(id));
};

export const getUserWallet = async (page = 1, limit = 10) => {
  return await userApi.get(`${USER_PROFILE_API.WALLET}?page=${page}&limit=${limit}`);
};

export const getUserNotificationsAPI = async (params: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.type) searchParams.append('type', params.type);

  const res = await userApi.get(`${USER_PROFILE_API.NOTIFICATIONS}?${searchParams.toString()}`);
  return res.data;
};

export const markUserNotificationAsReadAPI = async (id: string) => {
  return userApi.patch(`${USER_PROFILE_API.NOTIFICATION_MARK_READ(id)}`, {});
};

export const markAllUserNotificationsAsReadAPI = async () => {
  return userApi.patch(`${USER_PROFILE_API.NOTIFICATION_MARK_ALL_READ}`, {});
};

export const getUserUnreadCountAPI = async () => {
  const res = await userApi.get(`${USER_PROFILE_API.NOTIFICATIONS_UNREAD_COUNT}`);
  return res.data;
};

export const clearAllUserNotificationsAPI = async (type?: string) => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return userApi.post(`${USER_PROFILE_API.NOTIFICATION_CLEAR_ALL}?${searchParams.toString()}`);
};

export const reportBugAPI = async (data: { subject: string; description: string }) => {
  const res = userApi.post(USER_PROFILE_API.REPORT_ISSUE, data);
  return (await res).data;
};
