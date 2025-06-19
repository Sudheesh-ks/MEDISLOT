import { api } from "../axios/axiosInstance";
import { AUTH_API } from "../constants/apiRoutes";

// Register
export const registerUserAPI = async (
  name: string,
  email: string,
  password: string
) => {
  return await api.post(AUTH_API.REGISTER, { name, email, password });
};

// Login
export const loginUserAPI = async (email: string, password: string) => {
  return await api.post(AUTH_API.LOGIN, { email, password });
};

// Logout
export const logoutUserAPI = () => {
  return api.post(AUTH_API.LOGOUT);
};

// Refresh token
export const refreshAccessTokenAPI = async () => {
  return await api.post(AUTH_API.REFRESH); 
};

// OTP Verification
export const verifyOtpAPI = async (email: string, otp: string) => {
  return api.post(AUTH_API.OTP_VERIFY, { email, otp });
};

// Resend OTP
export const resendOtpAPI = async (email: string) => {
  return api.post(AUTH_API.OTP_RESEND, { email });
};

// Forgot password
export const verifyEmailAPI = async (email: string) => {
  return api.post(AUTH_API.FORGOT_PASSWORD, { email });
};

// Reset password
export const resetPasswordAPI = async (
  email: string,
  newPassword: string
) => {
  return api.post(AUTH_API.RESET_PASSWORD, { email, newPassword });
};
