import { api } from '../axios/axiosInstance';
import { doctorApi } from '../axios/doctorAxiosInstance';
import { APPOINTMENT_API } from '../constants/apiRoutes';

// Book an appointment
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotStartTime: string,
  slotEndTime: string,
  token: string
) => {
  return api.post(
    APPOINTMENT_API.BASE,
    { docId, slotDate, slotStartTime, slotEndTime },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Get all appointments
export const getAppointmentsAPI = async (token: string) => {
  return api.get(APPOINTMENT_API.BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getActiveAppointmentAPI = async () => {
  const res = await api.get(APPOINTMENT_API.ACTIVE_APPOINTMENT);
  return res.data;
};

export const getAppointmentsPaginatedAPI = async (token: string, page = 1, limit = 5) => {
  return api.get(APPOINTMENT_API.BASE + `?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cancel an appointment
export const cancelAppointmentAPI = async (appointmentId: string, token: string) => {
  return api.patch(
    APPOINTMENT_API.CANCEL(appointmentId),
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const getAvailableSlotsAPI = async (doctorId: string, date: string) => {
  const { data } = await api.get(APPOINTMENT_API.AVAILABLE_FOR_USER, {
    params: { doctorId, date },
  });
  return data.data;
};

export const submitFeedbackAPI = async (appointmentId: string, message: string, rating: number) => {
  return api.post(`/api/user/appointments/${appointmentId}/feedback`, { message, rating });
};

export async function getPrescriptionAPI(appointmentId: string, token: string) {
  return api.get(`/api/user/appointments/${appointmentId}/prescription`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export const getDoctorReviewsAPI = async (doctorId: string, token: string) => {
  return await api.get(`${APPOINTMENT_API.FEEDBACKS}/${doctorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAppointmentByIdAPI = async (appointmentId: string) => {
  const res = await doctorApi.get(`/api/doctor/appointments/${appointmentId}`);
  return res.data.appointment;
};
