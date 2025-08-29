import { doctorApi as api } from '../axios/doctorAxiosInstance';
import { BLOG_API, DOCTOR_API, SLOT_API } from '../constants/apiRoutes';

// Get paginated doctors
export const getDoctorsPaginatedAPI = (
  page: number,
  limit: number,
  search?: string,
  speciality?: string
) => {
  let url = `${DOCTOR_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (speciality) url += `&speciality=${encodeURIComponent(speciality)}`;
  return api.get(url);
};
export const getDoctorsByIDAPI = (id: string) => {
  return api.get(DOCTOR_API.DOCTOR_ID(id));
};

// Register doctor
export const registerDoctorAPI = (formData: FormData) => {
  return api.post(DOCTOR_API.REGISTER, formData);
};

// Doctor login
export const doctorLoginAPI = (email: string, password: string) => {
  return api.post(DOCTOR_API.LOGIN, { email, password });
};

// Doctor logout
export const logoutDoctorAPI = () => {
  return api.post(DOCTOR_API.LOGOUT);
};

// Refresh token
export const refreshDoctorAccessTokenAPI = () => {
  return api.post(DOCTOR_API.REFRESH);
};

// Get appointments for doctor
export const getDoctorAppointmentsAPI = () => {
  return api.get(DOCTOR_API.APPOINTMENTS);
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

  return api.get(url);
};

// Confirm appointment
export const AppointmentConfirmAPI = (appointmentId: string) => {
  return api.patch(DOCTOR_API.APPOINTMENT_CONFIRM(appointmentId));
};

// Cancel appointment
export const AppointmentCancelAPI = (appointmentId: string) => {
  return api.patch(DOCTOR_API.APPOINTMENT_CANCEL(appointmentId));
};

export const getActiveDoctorAppointmentAPI = async () => {
  const res = await api.get(DOCTOR_API.ACTIVE_APPOINTMENT);
  return res.data;
};

// Get doctor profile
export const getDoctorProfileAPI = () => {
  return api.get(DOCTOR_API.PROFILE);
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

  return api.patch(DOCTOR_API.PROFILE_UPDATE, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

  return await api.get(url);
};

export const getDoctorSlotsAPI = (year: number, month: number) =>
  api.get(DOCTOR_API.SLOTS, { params: { year, month } });

export const upsertDaySlotsAPI = (
  date: string,
  slots: { start: string; end: string; isAvailable: boolean }[],
  isCancelled: boolean
) => api.post(SLOT_API.SLOTS, { date, slots, isCancelled });

export const addDoctorSlotsAPI = upsertDaySlotsAPI;

export const getDaySlotsAPI = async (date: string) => {
  const res = await api.get(`${SLOT_API.SLOTS}/day`, { params: { date } });
  return res.data.data as {
    start: string;
    end: string;
    isAvailable: boolean;
  }[];
};

export const getDoctorNotificationsAPI = async (
  params: { page?: number; limit?: number; type?: string },
  token: string
) => {
  const searchParams = new URLSearchParams();
  searchParams.append('role', 'doctor');
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.type) searchParams.append('type', params.type);

  const res = await api.get(`${DOCTOR_API.NOTIFICATIONS}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const markDoctorNotificationAsReadAPI = async (id: string) => {
  return api.patch(DOCTOR_API.NOTIFICATION_MARK_READ(id), null, {
    params: { role: 'doctor' },
  });
};

export const markAllDoctorNotificationsAsReadAPI = async () => {
  return api.patch(DOCTOR_API.NOTIFICATION_MARK_ALL_READ, null, {
    params: { role: 'doctor' },
  });
};

export const getDoctorUnreadCountAPI = async () => {
  const res = await api.get(`${DOCTOR_API.NOTIFICATIONS_UNREAD_COUNT}?role=doctor`);
  return res.data;
};

export const clearAllDoctorNotificationsAPI = async (token: string, type?: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append('role', 'doctor');
  if (type) searchParams.append('type', type);

  return api.post(`${DOCTOR_API.NOTIFICATION_CLEAR_ALL}?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getDoctorDashboardDataAPI = (start?: string, end?: string) => {
  return api.get('/api/doctor/dashboard', {
    params: { start, end },
  });
};

export const createDoctorBlogAPI = (formData: FormData) => {
  return api.post(BLOG_API.CREATE, formData);
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
  return api.post(`/api/doctor/patient-history/${patientId}/${appointmentId}`, data);
};

export const getPatientHistoriesByPatientAPI = (patientId: string) => {
  return api.get(`/api/doctor/patient-history/${patientId}`);
};

export const getPatientHistoryByIdAPI = (historyId: string) => {
  return api.get(`/api/doctor/patient-history/${historyId}`);
};

export const getPatientDetailsAPI = (patientId: string) => {
  return api.get(`/api/doctor/patient/${patientId}`);
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
  return api.put(`/api/doctor/patient-history/${historyId}`, data);
};
