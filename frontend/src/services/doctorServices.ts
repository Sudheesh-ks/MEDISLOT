import { doctorApi as api } from "../axios/doctorAxiosInstance";
import { DOCTOR_API } from "../constants/apiRoutes";

// Get all doctors
export const getDoctorsAPI = () => {
  return api.get(DOCTOR_API.BASE);
};

export const getDoctorsByIDAPI = (id: string) => {
  return api.get(DOCTOR_API.DOCTOR_ID(id));
}

// Get paginated doctors
export const getDoctorsPaginatedAPI = (page: number, limit: number) => {
  return api.get(`${DOCTOR_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`);
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

// Get paginated appointments for doctor
export const getDoctorAppointmentsPaginatedAPI = (page: number, limit: number) => {
  return api.get(`${DOCTOR_API.APPOINTMENTS_PAGINATED}?page=${page}&limit=${limit}`);
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
data.append("available", (formData.available ?? false).toString());

  if (image) {
    data.append("image", image);
  }

  return api.patch(DOCTOR_API.PROFILE_UPDATE, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getDoctorSlotsAPI = (year: number, month: number) =>
  api.get(DOCTOR_API.SLOTS, { params: { year, month } });          

export const upsertDaySlotsAPI = (
  date: string,
  slots: { start: string; end: string; isAvailable: boolean }[],
  isCancelled: boolean
) => api.post(DOCTOR_API.SLOTS, { date, slots, isCancelled });     

export const addDoctorSlotsAPI = upsertDaySlotsAPI;

export const getDaySlotsAPI = async (date: string) => {
  const res = await api.get(`${DOCTOR_API.SLOTS}/day`, { params: { date } }); 
  return res.data.data as {
    start: string;
    end: string;
    isAvailable: boolean;
  }[];
};
