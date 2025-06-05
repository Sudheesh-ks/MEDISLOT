import { api } from "../axios/axiosInstance";

// Register User
export const registerUserAPI = async (
  name: string,
  email: string,
  password: string
) => {
  return await api.post("/api/user/register", { name, email, password });
};

// Login User
export const loginUserAPI = async (email: string, password: string) => {
  return await api.post("/api/user/login", { email, password });
};

// OTP Verification
export const verifyOtpAPI = async (email: string, otp: string) => {
  return await api.post("/api/user/verify-otp", { email, otp });
};

// Resend OTP
export const resendOtpAPI = async (email: string) => {
  return await api.post("/api/user/resend-otp", { email });
};

// Email Verification
export const verifyEmailAPI = async (email: string) => {
  return await api.post("/api/user/forgot-password", { email });
};

// Reset Password
export const resetPasswordAPI = async (email: string, newPassword: string) => {
  return await api.post("/api/user/reset-password", { email, newPassword });
};
