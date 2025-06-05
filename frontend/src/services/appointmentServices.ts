import { api } from "../axios/axiosInstance";

// Appointment Booking
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotTime: string,
  token: string
) => {
  return await api.post(
    "/api/book-appointment",
    { docId, slotDate, slotTime },
    { headers: { token } }
  );
};
