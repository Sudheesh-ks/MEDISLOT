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
  // ⬅️ CHANGED  /verify-otp → /otp/verify
  return api.post("/api/user/otp/verify", { email, otp }); // ⬅️ CHANGED
};

// OTP – resend
export const resendOtpAPI = async (email: string) => {
  // ⬅️ CHANGED  /resend-otp → /otp/resend
  return api.post("/api/user/otp/resend", { email }); // ⬅️ CHANGED
};

// Forgot-password request
export const verifyEmailAPI = async (email: string) => {
  // ⬅️ CHANGED  /forgot-password → /password/forgot
  return api.post("/api/user/password/forgot", { email }); // ⬅️ CHANGED
};

// Reset password
export const resetPasswordAPI = async (
  email: string,
  newPassword: string
) => {
  // ⬅️ CHANGED  /reset-password → /password/reset
  return api.post("/api/user/password/reset", { email, newPassword }); // ⬅️ CHANGED
};
