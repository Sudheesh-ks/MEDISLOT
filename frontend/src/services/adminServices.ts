import { api } from "../axios/axiosInstance";

// For admin login
export const adminLoginAPI = async (email: string, password: string) => {
  return await api.post("/api/admin/login", { email, password });
};

// For adding doctors
export const adminAddDoctorAPI = async (formData: FormData, token: string) => {
  return await api.post("/api/admin/doctors", formData, {
    headers: {
      aToken: token,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get all doctors
export const getAllDoctorsAPI = async (token: string) => {
  return await api.get(
    "/api/admin/doctors",
    {
      headers: { aToken: token },
    }
  );
};

// Change doctor availability
export const changeAvailabilityAPI = async (docId: string, isAvailable: boolean, token: string) => {
  return await api.patch(
    `/api/admin/doctors/${docId}/availability`,
    { isAvailable },
    {
      headers: { aToken: token },
    }
  );
};

// Get all users
export const getAllUsersAPI = async (token: string) => {
  return await api.get("/api/admin/users", {
    headers: { aToken: token },
  });
};

// Toggle user block/unblock
export const toggleUserBlockAPI = async (userId: string, block: boolean, token: string) => {
  return await api.patch(
    `/api/admin/users/${userId}/block`,
    { block },
    {
      headers: { aToken: token },
    }
  );
};


// To get all the appointments
export const getAllAppointmentsAPI = async (token: string) => {
  return await api.get(
    '/api/admin/appointments',
    {
      headers: { aToken: token },
    }
  );
};


// To cancel the appointments
export const adminCancelAppointmentAPI = async (appointmentId: string, token: string) => {
  return await api.patch(
    `/api/admin/appointments/${appointmentId}/cancel`,  
    {}, 
    {
      headers: { aToken: token },
    }
  );
};


// To get the dashboard data
export const adminDashboardAPI = async (token: string) => {
  return await api.get(
    '/api/admin/dashboard',
    {
      headers: { aToken: token },
    }
  );
};


