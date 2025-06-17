import { doctorApi as api } from "../axios/doctorAxiosInstance";

// Get list of all doctors (for admin/user maybe)
export const getDoctorsAPI = () => {
  return api.get("/api/doctor");
};

// Doctor registration
export const registerDoctorAPI = (formData: FormData) => {
  return api.post("/api/doctor/register", formData);
};

// Doctor login
export const doctorLoginAPI = (email: string, password: string) => {
  return api.post("/api/doctor/login", { email, password });
};

// Doctor logout
export const logoutDoctorAPI = () => {
  return api.post("/api/doctor/logout");
};

// Refresh doctor access token
export const refreshDoctorAccessTokenAPI = () => {
  return api.post("/api/doctor/refresh-token");
};

// Get all appointments for doctor
export const getDoctorAppointmentsAPI = () => {
  return api.get("/api/doctor/appointments");
};

// Confirm appointment
export const AppointmentConfirmAPI = (appointmentId: string) => {
  return api.patch(`/api/doctor/appointments/${appointmentId}/confirm`);
};

// Cancel appointment
export const AppointmentCancelAPI = (appointmentId: string) => {
  return api.patch(`/api/doctor/appointments/${appointmentId}/cancel`);
};

// Get doctor profile
export const getDoctorProfileAPI = () => {
  return api.get("/api/doctor/profile");
};

// Update doctor profile
export const updateDoctorProfileAPI = (
  formData: any,
  image: File | null
) => {
  const data = new FormData();

  data.append("doctId", formData._id);
  data.append("name", formData.name);
  data.append("speciality", formData.speciality);
  data.append("degree", formData.degree);
  data.append("experience", String(formData.experience));
  data.append("about", formData.about);
  data.append("fees", String(formData.fees));
  data.append("address", JSON.stringify(formData.address));

  if (image) {
    data.append("image", image);
  }

  return api.patch("/api/doctor/profile/update", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
