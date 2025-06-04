export type OtpPurpose = "register" | "reset-password";

export interface RegistrationOtpData {
  otp: string;
  purpose: "register";
  userData: {
    name: string;
    email: string;
    password: string;
  };
}

export interface ForgotPasswordOtpData {
  otp: string;
  purpose: "reset-password";
  email: string;
}

export type OtpStoreData = RegistrationOtpData | ForgotPasswordOtpData;

export const otpStore = new Map<string, OtpStoreData>();
