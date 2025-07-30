import { adminApi as api } from '../axios/adminAxiosInstance';
import { ADMIN_API } from '../constants/apiRoutes';

export const adminLoginAPI = async (email: string, password: string) => {
  return await api.post(ADMIN_API.LOGIN, { email, password });
};

export const refreshAdminAccessTokenAPI = () => {
  return api.post(ADMIN_API.REFRESH);
};

export const logoutAdminAPI = () => {
  return api.post(ADMIN_API.LOGOUT);
};

export const approveDoctorAPI = async (doctorId: string, token: string) => {
  return await api.patch(
    ADMIN_API.APPROVE_DOCTOR(doctorId),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const rejectDoctorAPI = async (
  doctorId: string,
  reason: string,
  token: string
) => {
  return await api.patch(
    ADMIN_API.REJECT_DOCTOR(doctorId),
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const adminAddDoctorAPI = async (formData: FormData, token: string) => {
  return await api.post(ADMIN_API.DOCTORS, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDoctorsPaginatedAPI = async (
  page: number,
  limit: number,
  token: string
) => {
  return await api.get(
    `${ADMIN_API.DOCTORS_PAGINATED}?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const changeAvailabilityAPI = async (
  docId: string,
  isAvailable: boolean,
  token: string
) => {
  return await api.patch(
    ADMIN_API.CHANGE_AVAILABILITY(docId),
    { isAvailable },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getUsersPaginatedAPI = async (
  page: number,
  limit: number,
  token: string
) => {
  return await api.get(
    `${ADMIN_API.USERS_PAGINATED}?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const toggleUserBlockAPI = async (
  userId: string,
  block: boolean,
  token: string
) => {
  return await api.patch(
    ADMIN_API.BLOCK_USER(userId),
    { block },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getAppointmentsPaginatedAPI = async (
  page: number,
  limit: number,
  token: string
) => {
  return await api.get(
    `${ADMIN_API.APPOINTMENTS_PAGINATED}?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const adminCancelAppointmentAPI = async (
  appointmentId: string,
  token: string
) => {
  return await api.patch(
    ADMIN_API.CANCEL_APPOINTMENT(appointmentId),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const adminDashboardAPI = async (token: string) => {
  return await api.get(ADMIN_API.DASHBOARD, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
