import { doctorApi as api } from "../axios/doctorAxiosInstance";
import { DOCTOR_API } from "../constants/apiRoutes";

// Get all doctors
export const getDoctorsAPI = () => {
  return api.get(DOCTOR_API.BASE);
};

// Register doctor
export const registerDoctorAPI = (formData: FormData) => {
  return api.post(DOCTOR_API.REGISTER, formData);
};

// Doctor login
export const doctorLoginAPI = (email: string, password: string) => {
  return api.post(DOCTOR_API.LOGIN, { email, password });
};

// Doctor logout
export const logoutDoctorAPI = () => {
  return api.post(DOCTOR_API.LOGOUT);
};

// Refresh token
export const refreshDoctorAccessTokenAPI = () => {
  return api.post(DOCTOR_API.REFRESH);
};

// Get appointments for doctor
export const getDoctorAppointmentsAPI = () => {
  return api.get(DOCTOR_API.APPOINTMENTS);
};

// Confirm appointment
export const AppointmentConfirmAPI = (appointmentId: string) => {
  return api.patch(DOCTOR_API.APPOINTMENT_CONFIRM(appointmentId));
};

// Cancel appointment
export const AppointmentCancelAPI = (appointmentId: string) => {
  return api.patch(DOCTOR_API.APPOINTMENT_CANCEL(appointmentId));
};

// Get doctor profile
export const getDoctorProfileAPI = () => {
  return api.get(DOCTOR_API.PROFILE);
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

  return api.patch(DOCTOR_API.PROFILE_UPDATE, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
