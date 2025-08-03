export const ADMIN_API = {
  LOGIN: '/api/admin/login',
  REFRESH: '/api/admin/refresh-token',
  LOGOUT: '/api/admin/logout',
  DOCTORS: '/api/admin/doctors',
  DOCTORS_PAGINATED: '/api/admin/doctors/paginated',
  APPROVE_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/approve`,
  REJECT_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/reject`,
  CHANGE_AVAILABILITY: (doctorId: string) => `/api/admin/doctors/${doctorId}/availability`,
  USERS: '/api/admin/users',
  USERS_PAGINATED: '/api/admin/users/paginated',
  BLOCK_USER: (userId: string) => `/api/admin/users/${userId}/block`,
  APPOINTMENTS: '/api/admin/appointments',
  APPOINTMENTS_PAGINATED: '/api/admin/appointments/paginated',
  CANCEL_APPOINTMENT: (appointmentId: string) => `/api/admin/appointments/${appointmentId}/cancel`,
  WALLET: '/api/admin/wallet',
  DASHBOARD: '/api/admin/dashboard',
};

export const APPOINTMENT_API = {
  BASE: '/api/user/appointments',
  CANCEL: (appointmentId: string) => `/api/user/appointments/${appointmentId}/cancel`,
  AVAILABLE_FOR_USER: '/api/user/available-slots',
};

export const AUTH_API = {
  REGISTER: '/api/user/register',
  LOGIN: '/api/user/login',
  LOGOUT: '/api/user/logout',
  REFRESH: '/api/user/refresh-token',

  OTP_VERIFY: '/api/user/otp/verify',
  OTP_RESEND: '/api/user/otp/resend',

  FORGOT_PASSWORD: '/api/user/password/forgot',
  RESET_PASSWORD: '/api/user/password/reset',
};

export const DOCTOR_API = {
  BASE: '/api/doctor',
  DOCTOR_ID: (id: string) => `/api/doctor/${id}`,
  REGISTER: '/api/doctor/register',
  LOGIN: '/api/doctor/login',
  LOGOUT: '/api/doctor/logout',
  REFRESH: '/api/doctor/refresh-token',
  SLOTS: '/api/doctor/slots',

  DOCTORS: '/api/doctor',
  DOCTORS_PAGINATED: '/api/doctor/paginated',
  APPOINTMENTS: '/api/doctor/appointments',
  APPOINTMENTS_PAGINATED: '/api/doctor/appointments/paginated',
  APPOINTMENT_CONFIRM: (appointmentId: string) =>
    `/api/doctor/appointments/${appointmentId}/confirm`,
  APPOINTMENT_CANCEL: (appointmentId: string) => `/api/doctor/appointments/${appointmentId}/cancel`,

  PROFILE: '/api/doctor/profile',
  PROFILE_UPDATE: '/api/doctor/profile/update',
  WALLET: '/api/doctor/wallet',
};

export const PAYMENT_API = {
  RAZORPAY_INIT: '/api/user/payments/razorpay',
  RAZORPAY_VERIFY: '/api/user/payments/razorpay/verify',
};

export const CHAT_API = {
  BASE: '/api/chat',
  HISTORY: (chatId: string) => `/api/chat/${chatId}`,
  DELETE_MESSAGE: (messageId: string) => `/api/chat/message/${messageId}`,
  MARK_READ: (chatId: string) => `/api/chat/${chatId}/read`,
  UPLOAD: '/api/chat/upload',
};

export const USER_PROFILE_API = {
  GET: '/api/user/profile',
  UPDATE: '/api/user/profile',
  USERBY_ID: (id: string) => `/api/user/${id}`,
  WALLET: '/api/user/wallet',
};

export const SLOT_API = {
  SLOTS: '/api/slots',
};
