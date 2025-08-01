import { api } from '../axios/axiosInstance';
import { APPOINTMENT_API } from '../constants/apiRoutes';

// Book an appointment
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotTime: string,
  token: string
) => {
  return api.post(
    APPOINTMENT_API.BASE,
    { docId, slotDate, slotTime },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Get all appointments
export const getAppointmentsAPI = async (token: string) => {
  return api.get(APPOINTMENT_API.BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
