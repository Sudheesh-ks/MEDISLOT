import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});


// Appointment Booking
export const appointmentBookingAPI = async (docId: string, slotDate: string, slotTime: string, token: string) => {
  return await api.post('/api/book-appointment', { docId, slotDate, slotTime },{ headers: { token } });
};