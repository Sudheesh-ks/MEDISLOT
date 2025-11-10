import { doctorApi } from '../axios/axiosInstance';
import { BLOG_API, DOCTOR_API, SLOT_API } from '../constants/apiRoutes';

// Get paginated doctors
export const getDoctorsPaginatedAPI = (
  page: number,
  limit: number,
  search?: string,
  speciality?: string,
  minRating?: number,
  sortOrder?: string
) => {
  let url = `${DOCTOR_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (speciality) url += `&speciality=${encodeURIComponent(speciality)}`;
  if (minRating) url += `&minRating=${minRating}`;
  if (sortOrder) url += `&sortOrder=${sortOrder}`;
  return doctorApi.get(url);
};

export const getDoctorsByIDAPI = (id: string) => {
  return doctorApi.get(DOCTOR_API.DOCTOR_ID(id));
};

// Register doctor
export const registerDoctorAPI = (formData: FormData) => {
  return doctorApi.post(DOCTOR_API.REGISTER, formData);
};

// Doctor login
export const doctorLoginAPI = (email: string, password: string) => {
  return doctorApi.post(DOCTOR_API.LOGIN, { email, password });
};

// Doctor logout
export const logoutDoctorAPI = () => {
  return doctorApi.post(DOCTOR_API.LOGOUT);
};

// Refresh token
export const refreshDoctorAccessTokenAPI = () => {
  return doctorApi.post(DOCTOR_API.REFRESH);
};

// Get appointments for doctor
export const getDoctorAppointmentsAPI = () => {
  return doctorApi.get(DOCTOR_API.APPOINTMENTS);
};

// Get paginated appointments for doctor
export const getDoctorAppointmentsPaginatedAPI = (
  page: number,
  limit: number,
  search?: string,
  dateRange?: string
) => {
  let url = `${DOCTOR_API.APPOINTMENTS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (dateRange) url += `&dateRange=${encodeURIComponent(dateRange)}`;

  return doctorApi.get(url);
};

// Confirm appointment
export const AppointmentConfirmAPI = (appointmentId: string) => {
  return doctorApi.patch(DOCTOR_API.APPOINTMENT_CONFIRM(appointmentId));
};

// Cancel appointment
export const AppointmentCancelAPI = (appointmentId: string) => {
  return doctorApi.patch(DOCTOR_API.APPOINTMENT_CANCEL(appointmentId));
};

export const getActiveDoctorAppointmentAPI = async () => {
  const res = await doctorApi.get(DOCTOR_API.ACTIVE_APPOINTMENT);
  return res.data;
};

// Get doctor profile
export const getDoctorProfileAPI = () => {
  return doctorApi.get(DOCTOR_API.PROFILE);
};

// Update doctor profile
export const updateDoctorProfileAPI = (formData: any, image: File | null) => {
  const data = new FormData();

  data.append('doctId', formData._id);
  data.append('name', formData.name);
  data.append('speciality', formData.speciality);
  data.append('degree', formData.degree);
  data.append('experience', String(formData.experience));
  data.append('about', formData.about);
  data.append('fees', String(formData.fees));
  data.append('address', JSON.stringify(formData.address));
  data.append('available', (formData.available ?? false).toString());

  if (image) {
    data.append('image', image);
  }

  return doctorApi.patch(DOCTOR_API.PROFILE_UPDATE, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changeDoctorPasswordAPI = async (oldPassword: string, newPassword: string) => {
  const res = await doctorApi.post('/api/doctor/change-password', { oldPassword, newPassword });
  return res.data;
};

export const getDoctorWalletAPI = async (
  page: number,
  limit: number,
  search?: string,
  period?: string,
  type?: string
) => {
  let url = `${DOCTOR_API.WALLET}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period) url += `&period=${encodeURIComponent(period)}`;
  if (type && type !== 'all') url += `&txnType=${encodeURIComponent(type)}`;

  return await doctorApi.get(url);
};

export const getDoctorSlotsAPI = (year: number, month: number) =>
  doctorApi.get(DOCTOR_API.SLOTS, { params: { year, month } });

export const upsertDaySlotsAPI = (
  date: string,
  slots: { start: string; end: string; isAvailable: boolean }[],
  isCancelled: boolean
) => doctorApi.post(SLOT_API.SLOTS, { date, slots, isCancelled });

export const addDoctorSlotsAPI = upsertDaySlotsAPI;

export const getDefaultSlotAPI = async (weekday: number) => {
  const res = await doctorApi.get(`${SLOT_API.SLOTS}/default`, { params: { weekday } });
  return res.data.data as { start: string; end: string; isAvailable: boolean }[];
};

export const saveWeeklyDefaultAPI = (
  weekday: number,
  slots: { start: string; end: string; isAvailable: boolean }[]
) => doctorApi.post(`${SLOT_API.SLOTS}/default`, { weekday, slots, isCancelled: false });

export const getDaySlotsAPI = async (date: string) => {
  const res = await doctorApi.get(`${SLOT_API.SLOTS}/day`, { params: { date } });
  return res.data.data as { start: string; end: string; isAvailable: boolean }[];
};

export const getWeeklyDefaultsAPI = async () => {
  const res = await doctorApi.get(`${SLOT_API.SLOTS}/weekly-defaults`);
  return res.data.data as Record<string, Range[]>;
};

export const getDoctorNotificationsAPI = async (params: {
  page?: number;
  limit?: number;
  type?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.type) searchParams.append('type', params.type);

  const res = await doctorApi.get(`${DOCTOR_API.NOTIFICATIONS}?${searchParams.toString()}`);
  return res.data;
};

export const markDoctorNotificationAsReadAPI = async (id: string) => {
  return doctorApi.patch(DOCTOR_API.NOTIFICATION_MARK_READ(id), null);
};

export const markAllDoctorNotificationsAsReadAPI = async () => {
  return doctorApi.patch(DOCTOR_API.NOTIFICATION_MARK_ALL_READ, null);
};

export const getDoctorUnreadCountAPI = async () => {
  const res = await doctorApi.get(`${DOCTOR_API.NOTIFICATIONS_UNREAD_COUNT}`);
  return res.data;
};

export const clearAllDoctorNotificationsAPI = async (type?: string) => {
  const searchParams = new URLSearchParams();
  if (type) searchParams.append('type', type);

  return doctorApi.post(`${DOCTOR_API.NOTIFICATION_CLEAR_ALL}?${searchParams.toString()}`);
};

export const getDoctorDashboardDataAPI = (start?: string, end?: string) => {
  return doctorApi.get('/api/doctor/dashboard', {
    params: { start, end },
  });
};

export const getBlogCategoriesAPI = () => {
  return doctorApi.get("/api/blog/categories");
};

export const createDoctorBlogAPI = (formData: FormData) => {
  return doctorApi.post(BLOG_API.CREATE, formData);
};

export const deleteDoctorBlogAPI = (id: string) => {
  return doctorApi.delete(`${BLOG_API.UPDATE}/${id}`);
};

export const getDoctorBlogsAPI = () => {
  return doctorApi.get(BLOG_API.DOCTOR_BLOGS);
};

export const getDoctorBlogByIdAPI = (id: string) => {
  return doctorApi.get(BLOG_API.BY_ID(id));
};

export const updateDoctorBlogAPI = (id: string, formData: FormData) => {
  return doctorApi.put(`${BLOG_API.UPDATE}/${id}`, formData);
};

export const createPatientHistoryAPI = (
  patientId: string,
  appointmentId: string,
  data: {
    date: string;
    time: string;
    type: string;
    chiefComplaint: string;
    symptoms: string[];
    vitals: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      weight?: string;
      height?: string;
      oxygenSaturation?: string;
    };
    diagnosis: string;
    doctorNotes?: string;
    prescription: {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
  }
) => {
  return doctorApi.post(`/api/doctor/patient-history/${patientId}/${appointmentId}`, data);
};

export const getPatientHistoriesByPatientAPI = (patientId: string) => {
  return doctorApi.get(`/api/doctor/patient-history/${patientId}`);
};

export const getPatientHistoryByIdAPI = (historyId: string) => {
  return doctorApi.get(`/api/doctor/patient-history/${historyId}`);
};

export const getPatientDetailsAPI = (patientId: string) => {
  return doctorApi.get(`/api/doctor/patient/${patientId}`);
};

export const updatePatientHistoryAPI = (
  historyId: string,
  data: {
    date: string;
    time: string;
    type: string;
    chiefComplaint: string;
    symptoms: string[];
    vitals: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      weight?: string;
      height?: string;
      oxygenSaturation?: string;
    };
    diagnosis: string;
    doctorNotes?: string;
    prescription: {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
  }
) => {
  return doctorApi.put(`/api/doctor/patient-history/${historyId}`, data);
};

export const reportDoctorIssueAPI = async (data: { subject: string; description: string }) => {
  const res = await doctorApi.post('/api/doctor/complaints/report', data);
  return res.data;
};
