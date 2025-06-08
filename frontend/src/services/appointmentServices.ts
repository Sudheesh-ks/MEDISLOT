import { api } from "../axios/axiosInstance";

// Appointment Booking
export const appointmentBookingAPI = async (
  docId: string,
  slotDate: string,
  slotTime: string,
  token: string
) => {
  return await api.post(
    "/api/user/book-appointment",
    { docId, slotDate, slotTime },
    {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  );
};


export const getAppointmentsAPI = async (token: string) => {
  return await api.get('/api/user/appointments', 
    {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  )
}


export const cancelAppointmentAPI = async (appointmentId: string, token: string) => {
  return await api.post('/api/user/cancel-appointment', 
    {appointmentId},
    {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  )
}

