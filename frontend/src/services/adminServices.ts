import { adminApi } from '../axios/axiosInstance';
import { ADMIN_API } from '../constants/apiRoutes';

export const adminLoginAPI = async (email: string, password: string) => {
  return await adminApi.post(ADMIN_API.LOGIN, { email, password });
};

export const refreshAdminAccessTokenAPI = () => {
  return adminApi.post(ADMIN_API.REFRESH);
};

export const logoutAdminAPI = () => {
  return adminApi.post(ADMIN_API.LOGOUT);
};

export const approveDoctorAPI = async (doctorId: string) => {
  return await adminApi.patch(ADMIN_API.APPROVE_DOCTOR(doctorId), {});
};

export const rejectDoctorAPI = async (doctorId: string, reason: string) => {
  return await adminApi.patch(ADMIN_API.REJECT_DOCTOR(doctorId), { reason });
};

export const blockDoctorAPI = async (doctorId: string, reason: string) => {
  return await adminApi.patch(ADMIN_API.BLOCK_DOCTOR(doctorId), { reason });
};

export const unBlockDoctorAPI = async (doctorId: string) => {
  return await adminApi.patch(ADMIN_API.UNBLOCK_DOCTOR(doctorId));
};

export const adminAddDoctorAPI = async (formData: FormData) => {
  return await adminApi.post(ADMIN_API.DOCTORS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDoctorByIdAPI = async (doctorId: string) => {
  return await adminApi.get(ADMIN_API.GET_DOCTOR_BY_ID(doctorId));
};

export const getDoctorsPaginatedAPI = async (page: number, limit: number, search?: string) => {
  let url = `${ADMIN_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return await adminApi.get(url);
};

export const changeAvailabilityAPI = async (docId: string, isAvailable: boolean) => {
  return await adminApi.patch(ADMIN_API.CHANGE_AVAILABILITY(docId), { isAvailable });
};

export const getUsersPaginatedAPI = async (page: number, limit: number, search?: string) => {
  let url = `${ADMIN_API.USERS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return await adminApi.get(url);
};

export const toggleUserBlockAPI = async (userId: string, block: boolean) => {
  return await adminApi.patch(ADMIN_API.BLOCK_USER(userId), { block });
};

export const getAppointmentsPaginatedAPI = async (
  page: number,
  limit: number,
  search = '',
  dateRange?: string
) => {
  let url = `${ADMIN_API.APPOINTMENTS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (dateRange) url += `&dateRange=${encodeURIComponent(dateRange)}`;
  return adminApi.get(url);
};

export const adminCancelAppointmentAPI = async (appointmentId: string) => {
  return await adminApi.patch(ADMIN_API.CANCEL_APPOINTMENT(appointmentId), {});
};

export const getAdminWalletAPI = async (
  page: number,
  limit: number,
  search?: string,
  period?: string,
  type?: string
) => {
  let url = `${ADMIN_API.WALLET}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period) url += `&period=${encodeURIComponent(period)}`;
  if (type && type !== 'all') url += `&txnType=${encodeURIComponent(type)}`;
  return await adminApi.get(url);
};

export const adminDashboardAPI = async () => {
  return await adminApi.get(ADMIN_API.DASHBOARD);
};

export const getLatestDoctorRequestsAPI = async (limit = 5) => {
  const res = await adminApi.get(`${ADMIN_API.DASHBOARD_LATEST_REQUESTS}?limit=${limit}`);
  return res.data.requests;
};

export const getAppointmentsStatsAPI = async (startDate?: string, endDate?: string) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await adminApi.get(ADMIN_API.DASHBOARD_APPOINTMENTS_STATS, { params });
  return res.data.data;
};

export const getTopDoctorsAPI = async (limit = 5) => {
  const res = await adminApi.get(ADMIN_API.DASHBOARD_TOP_DOCTORS, { params: { limit } });
  return res.data.data;
};

export const getRevenueStatsAPI = async (startDate?: string, endDate?: string) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await adminApi.get(ADMIN_API.DASHBOARD_REVENUE, { params });
  return res.data.data;
};

export const getAdminNotificationsAPI = async (params: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.type) searchParams.append('type', params.type);

  const res = await adminApi.get(`${ADMIN_API.NOTIFICATIONS}?${searchParams.toString()}`);
  return res.data;
};

export const markAdminNotificationAsReadAPI = async (id: string) => {
  return adminApi.patch(`${ADMIN_API.NOTIFICATION_MARK_READ(id)}`, {});
};

export const markAllAdminNotificationsAsReadAPI = async () => {
  return adminApi.patch(`${ADMIN_API.NOTIFICATION_MARK_ALL_READ}`, {});
};

export const getAdminUnreadCountAPI = async () => {
  const res = await adminApi.get(`${ADMIN_API.NOTIFICATIONS_UNREAD_COUNT}`);
  return res.data;
};

export const clearAllAdminNotificationsAPI = async (type?: string) => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return adminApi.post(`${ADMIN_API.NOTIFICATION_CLEAR_ALL}?${searchParams.toString()}`);
};

export const getComplaintsPaginatedAPI = async (
  page: number,
  limit: number,
  search?: string,
  status?: 'pending' | 'in-progress' | 'resolved' | 'rejected' | 'all'
) => {
  let url = `${ADMIN_API.COMPLAINTS}?page=${page}&limit=${limit}`;
  if (search) url += `&q=${encodeURIComponent(search)}`;
  if (status && status !== 'all') url += `&status=${status}`;
  return await adminApi.get(url);
};

export const updateComplainStatusAPI = async (id: string, status: string) => {
  return await adminApi.patch(`${ADMIN_API.UPDATE_COMPLAINT(id)}`, { status });
};
