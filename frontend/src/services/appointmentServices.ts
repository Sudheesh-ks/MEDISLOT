import { api } from "../axios/axiosInstance";

// Appointment Booking
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotTime: string,
  token: string
) => {
  // ⬅️ CHANGED  POST /book-appointment  →  POST /appointments
  return api.post(
    "/api/user/appointments",            // ⬅️ CHANGED
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
  // ⬅️ CHANGED: POST /cancel-appointment → PATCH /appointments/:id/cancel, no body
  return api.patch(
    `/api/user/appointments/${appointmentId}/cancel`,  // ⬅️ CHANGED
    {},                                                // ⬅️ no body needed
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

