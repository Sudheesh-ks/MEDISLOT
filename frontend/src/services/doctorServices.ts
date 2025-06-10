import { api } from "../axios/axiosInstance";

// To list all doctors
export const getDoctorsAPI = async () => {
  return await api.get("/api/doctor/list");
};

// For doctor login
export const doctorLoginAPI = async (email: string, password: string) => {
  return await api.post("/api/doctor/login", { email, password });
};

// For getting all doctor appointments
export const getDoctorAppointmentsAPI = async (token: string) => {
  return api.get('/api/doctor/appointments', {
    headers: {
      Authorization: `Bearer ${token}`,  
    },
  });
};
// For marking a doctor appointment as completed
export const AppointmentCompleteAPI = async (appointmentId: string, token: string) => {
  return api.post('/api/doctor/complete-appointment', { appointmentId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// For cancelling a doctor appointment
export const AppointmentCancelAPI = async (appointmentId: string, token: string) => {
  return api.post('/api/doctor/cancel-appointment', { appointmentId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
