import { api } from "../axios/axiosInstance";
import { ADMIN_API } from "../constants/apiRoutes";

export const adminLoginAPI = async (email: string, password: string) => {
  return await api.post(ADMIN_API.LOGIN, { email, password });
};

export const approveDoctorAPI = async (doctorId: string, token: string) => {
  return await api.patch(ADMIN_API.APPROVE_DOCTOR(doctorId), {}, {
    headers: { aToken: token },
  });
};

export const rejectDoctorAPI = async (doctorId: string, token: string) => {
  return await api.patch(ADMIN_API.REJECT_DOCTOR(doctorId), {}, {
    headers: { aToken: token },
  });
};

export const adminAddDoctorAPI = async (formData: FormData, token: string) => {
  return await api.post(ADMIN_API.DOCTORS, formData, {
    headers: {
      aToken: token,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllDoctorsAPI = async (token: string) => {
  return await api.get(ADMIN_API.DOCTORS, {
    headers: { aToken: token },
  });
};

export const changeAvailabilityAPI = async (
  docId: string,
  isAvailable: boolean,
  token: string
) => {
  return await api.patch(ADMIN_API.CHANGE_AVAILABILITY(docId), { isAvailable }, {
    headers: { aToken: token },
  });
};

export const getAllUsersAPI = async (token: string) => {
  return await api.get(ADMIN_API.USERS, {
    headers: { aToken: token },
  });
};

export const toggleUserBlockAPI = async (
  userId: string,
  block: boolean,
  token: string
) => {
  return await api.patch(ADMIN_API.BLOCK_USER(userId), { block }, {
    headers: { aToken: token },
  });
};

export const getAllAppointmentsAPI = async (token: string) => {
  return await api.get(ADMIN_API.APPOINTMENTS, {
    headers: { aToken: token },
  });
};

export const adminCancelAppointmentAPI = async (
  appointmentId: string,
  token: string
) => {
  return await api.patch(ADMIN_API.CANCEL_APPOINTMENT(appointmentId), {}, {
    headers: { aToken: token },
  });
};

export const adminDashboardAPI = async (token: string) => {
  return await api.get(ADMIN_API.DASHBOARD, {
    headers: { aToken: token },
  });
};
