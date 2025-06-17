import axios from "axios";
import {
  getDoctorAccessToken,
  updateDoctorAccessToken,
} from "../context/tokenManagerDoctor";

// Create instance
export const doctorApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Include cookies (refreshToken)
});

// Add access token to request headers
doctorApi.interceptors.request.use(
  (config) => {
    const token = getDoctorAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (token expired)
doctorApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/doctor/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;

        updateDoctorAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return doctorApi(originalRequest);
      } catch (refreshError) {
        console.error("Doctor token refresh failed", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);
