import { doctorApi, userApi } from '../axios/axiosInstance';
import { APPOINTMENT_API } from '../constants/apiRoutes';

// Book an appointment
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotStartTime: string,
  slotEndTime: string
) => {
  return userApi.post(APPOINTMENT_API.BASE, { docId, slotDate, slotStartTime, slotEndTime });
};

// Get all appointments
export const getAppointmentsAPI = async () => {
  return userApi.get(APPOINTMENT_API.BASE);
};

export const getActiveAppointmentAPI = async () => {
  const res = await userApi.get(APPOINTMENT_API.ACTIVE_APPOINTMENT);
  return res.data;
};

export const getAppointmentsPaginatedAPI = async (
  page = 1,
  limit = 5,
  filterType: 'all' | 'upcoming' | 'ended' = 'all'
) => {
  const url = `${APPOINTMENT_API.BASE}?page=${page}&limit=${limit}&filterType=${filterType}`;
  return userApi.get(url);
};

// Cancel an appointment
export const cancelAppointmentAPI = async (appointmentId: string) => {
  return userApi.patch(APPOINTMENT_API.CANCEL(appointmentId), {});
};

export const getAvailableSlotsAPI = async (doctorId: string, date: string) => {
  const { data } = await userApi.get(APPOINTMENT_API.AVAILABLE_FOR_USER, {
    params: { doctorId, date },
  });
  return data.data;
};

export const submitFeedbackAPI = async (appointmentId: string, message: string, rating: number) => {
  return userApi.post(`/api/user/appointments/${appointmentId}/feedback`, { message, rating });
};

export const getPrescriptionAPI = async (appointmentId: string) => {
  return userApi.get(`/api/user/appointments/${appointmentId}/prescription`);
};

export const getDoctorReviewsAPI = async (doctorId: string) => {
  return userApi.get(`${APPOINTMENT_API.FEEDBACKS}/${doctorId}`);
};

export const getAppointmentByIdAPI = async (appointmentId: string) => {
  const res = await doctorApi.get(`/api/doctor/appointments/${appointmentId}`);
  return res.data.appointment;
};
