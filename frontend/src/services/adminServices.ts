import { adminApi as api } from '../axios/adminAxiosInstance';
import { ADMIN_API } from '../constants/apiRoutes';

export const adminLoginAPI = async (email: string, password: string) => {
  return await api.post(ADMIN_API.LOGIN, { email, password });
};

export const refreshAdminAccessTokenAPI = () => {
  return api.post(ADMIN_API.REFRESH);
};

export const logoutAdminAPI = () => {
  return api.post(ADMIN_API.LOGOUT);
};

export const approveDoctorAPI = async (doctorId: string, token: string) => {
  return await api.patch(
    ADMIN_API.APPROVE_DOCTOR(doctorId),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const rejectDoctorAPI = async (doctorId: string, reason: string, token: string) => {
  return await api.patch(
    ADMIN_API.REJECT_DOCTOR(doctorId),
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const adminAddDoctorAPI = async (formData: FormData, token: string) => {
  return await api.post(ADMIN_API.DOCTORS, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDoctorsPaginatedAPI = async (page: number, limit: number, token: string) => {
  return await api.get(`${ADMIN_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changeAvailabilityAPI = async (docId: string, isAvailable: boolean, token: string) => {
  return await api.patch(
    ADMIN_API.CHANGE_AVAILABILITY(docId),
    { isAvailable },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getUsersPaginatedAPI = async (page: number, limit: number, token: string) => {
  return await api.get(`${ADMIN_API.USERS_PAGINATED}?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const toggleUserBlockAPI = async (userId: string, block: boolean, token: string) => {
  return await api.patch(
    ADMIN_API.BLOCK_USER(userId),
    { block },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAppointmentsPaginatedAPI = async (page: number, limit: number, token: string) => {
  return await api.get(`${ADMIN_API.APPOINTMENTS_PAGINATED}?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const adminCancelAppointmentAPI = async (appointmentId: string, token: string) => {
  return await api.patch(
    ADMIN_API.CANCEL_APPOINTMENT(appointmentId),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAdminWalletAPI = async () => {
  return await api.get(ADMIN_API.WALLET);
};

export const adminDashboardAPI = async (token: string) => {
  return await api.get(ADMIN_API.DASHBOARD, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLatestDoctorRequestsAPI = async (token: string, limit = 5) => {
  const res = await api.get(`${ADMIN_API.DASHBOARD_LATEST_REQUESTS}?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.requests;
};

export const getAppointmentsStatsAPI = async (
  token: string,
  startDate?: string,
  endDate?: string
) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await api.get(ADMIN_API.DASHBOARD_APPOINTMENTS_STATS, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data.data; // array {date, count}
};

export const getTopDoctorsAPI = async (token: string, limit = 5) => {
  const res = await api.get(ADMIN_API.DASHBOARD_TOP_DOCTORS, {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit },
  });
  return res.data.data;
};

export const getRevenueStatsAPI = async (token: string, startDate?: string, endDate?: string) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await api.get(ADMIN_API.DASHBOARD_REVENUE, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return res.data.data; // array {date, revenue}
};

export const getAdminNotificationsAPI = async (
  params: { limit?: number; before?: string; type?: string },
  token: string
) => {
  const searchParams = new URLSearchParams();
  searchParams.append('role', 'admin');
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.before) searchParams.append('before', params.before);
  if (params.type) searchParams.append('type', params.type);

  const res = await api.get(`${ADMIN_API.NOTIFICATIONS}?${searchParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.notifications;
};

export const markAdminNotificationAsReadAPI = async (id: string, token: string) => {
  return api.patch(
    `${ADMIN_API.NOTIFICATION_MARK_READ(id)}?role=admin`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const markAllAdminNotificationsAsReadAPI = async (token: string) => {
  return api.patch(
    `${ADMIN_API.NOTIFICATION_MARK_ALL_READ}?role=admin`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAdminUnreadCountAPI = async () => {
  const res = await api.get(`${ADMIN_API.NOTIFICATIONS_UNREAD_COUNT}`);
  return res.data;
};
