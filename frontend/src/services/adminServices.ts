import { api } from "../axios/axiosInstance";

// For admin login
export const adminLoginAPI = async (email: string, password: string) => {
  return await api.post("/api/admin/login", { email, password });
};

// For adding doctors
export const adminAddDoctorAPI = async (formData: FormData, token: string) => {
  return await api.post("/api/admin/add-doctor", formData, {
    headers: {
      aToken: token,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get all doctors
export const getAllDoctorsAPI = async (token: string) => {
  return await api.post(
    "/api/admin/all-doctors",
    {},
    {
      headers: { aToken: token },
    }
  );
};

// Change doctor availability
export const changeAvailabilityAPI = async (docId: string, aToken: string) => {
  return await api.post(
    "/api/admin/change-availability",
    { docId },
    {
      headers: { aToken },
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
export const toggleUserBlockAPI = async (userId: string, aToken: string) => {
  return await api.post(
    "/api/admin/toggle-user-block",
    { userId },
    {
      headers: { aToken },
    }
  );
};
