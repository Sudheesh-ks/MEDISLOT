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
  return api.post("/api/user/otp/verify", { email, otp });
};

// OTP – resend
export const resendOtpAPI = async (email: string) => {
  return api.post("/api/user/otp/resend", { email });
};

// Forgot-password request
export const verifyEmailAPI = async (email: string) => {
  return api.post("/api/user/password/forgot", { email });
};

// Reset password
export const resetPasswordAPI = async (email: string, newPassword: string) => {
  return api.post("/api/user/password/reset", { email, newPassword });
};
