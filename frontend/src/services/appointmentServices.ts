import { api } from "../axios/axiosInstance";

// Appointment Booking
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotTime: string,
  token: string
) => {
  return api.post(
    "/api/user/appointments",           
    { docId, slotDate, slotTime },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Get all appointments (unchanged)
export const getAppointmentsAPI = async (token: string) => {
  return api.get("/api/user/appointments", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cancel an appointment
export const cancelAppointmentAPI = async (
  appointmentId: string,
  token: string
) => {
  return api.patch(
    `/api/user/appointments/${appointmentId}/cancel`,  
    {},                                                
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

