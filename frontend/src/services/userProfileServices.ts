import { api } from '../axios/axiosInstance';
import { showErrorToast } from '../utils/errorHandler';
import { USER_PROFILE_API } from '../constants/apiRoutes';

// Get user profile
export const getUserProfileAPI = async (token: string) => {
  return api.get(USER_PROFILE_API.GET, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update user profile
export const updateUserProfileAPI = async (token: string, data: any, image: File | null) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('dob', data.dob);
    formData.append('address[line1]', data.address.line1);
    formData.append('address[line2]', data.address.line2);
    if (image) formData.append('image', image);

    const res = await api.put(USER_PROFILE_API.UPDATE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

export const getUserByIDAPI = async (id: string) => {
  return await api.get(USER_PROFILE_API.USERBY_ID(id));
};

export const getUserWallet = async (page = 1, limit = 10) => {
  return await api.get(`${USER_PROFILE_API.WALLET}?page=${page}&limit=${limit}`);
};

export const getUserNotificationsAPI = async (
  params: { page?: number; limit?: number; type?: string },
  token: string
) => {
  const searchParams = new URLSearchParams();
  searchParams.append('role', 'user');
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.type) searchParams.append('type', params.type);

  const res = await api.get(`${USER_PROFILE_API.NOTIFICATIONS}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const markUserNotificationAsReadAPI = async (id: string, token: string) => {
  return api.patch(
    `${USER_PROFILE_API.NOTIFICATION_MARK_READ(id)}?role=user`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const markAllUserNotificationsAsReadAPI = async (token: string) => {
  return api.patch(
    `${USER_PROFILE_API.NOTIFICATION_MARK_ALL_READ}?role=user`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getUserUnreadCountAPI = async () => {
  const res = await api.get(`${USER_PROFILE_API.NOTIFICATIONS_UNREAD_COUNT}?role=user`);
  return res.data;
};

export const clearAllUserNotificationsAPI = async (token: string, type?: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append('role', 'user');
  if (type) searchParams.append('type', type);

  return api.post(`${USER_PROFILE_API.NOTIFICATION_CLEAR_ALL}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
