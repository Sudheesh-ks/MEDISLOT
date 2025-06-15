import { api } from "../axios/axiosInstance";

// To list all doctors
export const getDoctorsAPI = async () => {
  return await api.get("/api/doctor");
};

// For doctor registration
export const registerDoctorAPI = (formData: FormData) => {
  return api.post("/api/doctor/register", formData);
};

// For doctor login
export const doctorLoginAPI = async (email: string, password: string) => {
  return await api.post("/api/doctor/login", { email, password });
};

// For getting all doctor appointments
export const getDoctorAppointmentsAPI = async (token: string) => {
  return api.get("/api/doctor/appointments", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// For marking a doctor appointment as confirmed
export const AppointmentConfirmAPI = async (
  appointmentId: string,
  token: string
) => {
  return api.patch(
    `/api/doctor/appointments/${appointmentId}/confirm`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// For cancelling a doctor appointment (REST update)
export const AppointmentCancelAPI = async (
  appointmentId: string,
  token: string
) => {
  return api.patch(
    `/api/doctor/appointments/${appointmentId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
