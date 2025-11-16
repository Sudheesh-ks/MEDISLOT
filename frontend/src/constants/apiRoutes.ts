export const ADMIN_API = {
  LOGIN: '/api/admin/login',
  REFRESH: '/api/admin/refresh-token',
  LOGOUT: '/api/admin/logout',
  DOCTORS: '/api/admin/doctors',
  GET_DOCTOR_BY_ID: (id: string) => `/api/admin/doctors/${id}`,
  DOCTORS_PAGINATED: '/api/admin/doctors/paginated',
  APPROVE_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/approve`,
  REJECT_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/reject`,
  BLOCK_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/block`,
  UNBLOCK_DOCTOR: (doctorId: string) => `/api/admin/doctors/${doctorId}/unblock`,
  CHANGE_AVAILABILITY: (doctorId: string) => `/api/admin/doctors/${doctorId}/availability`,
  USERS: '/api/admin/users',
  USERS_PAGINATED: '/api/admin/users/paginated',
  BLOCK_USER: (userId: string) => `/api/admin/users/${userId}/block`,
  APPOINTMENTS: '/api/admin/appointments',
  APPOINTMENTS_PAGINATED: '/api/admin/appointments/paginated',
  CANCEL_APPOINTMENT: (appointmentId: string) => `/api/admin/appointments/${appointmentId}/cancel`,
  WALLET: '/api/admin/wallet',
  DASHBOARD: '/api/admin/dashboard',
  DASHBOARD_LATEST_REQUESTS: '/api/admin/dashboard/latest-doctor-requests',
  DASHBOARD_APPOINTMENTS_STATS: '/api/admin/dashboard/stats/appointments',
  DASHBOARD_TOP_DOCTORS: '/api/admin/dashboard/stats/top-doctors',
  DASHBOARD_REVENUE: '/api/admin/dashboard/stats/revenue',
  NOTIFICATIONS: '/api/admin/notifications',
  NOTIFICATION_MARK_READ: (id: string) => `/api/admin/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: '/api/admin/notifications/read-all',
  NOTIFICATIONS_UNREAD_COUNT: '/api/admin/notifications/unread-count',
  NOTIFICATION_CLEAR_ALL: '/api/admin/notifications/clear-all',
  COMPLAINTS: '/api/admin/complaints',
  UPDATE_COMPLAINT: (id: string) => `/api/admin/complaints/update/${id}`,
};

export const APPOINTMENT_API = {
  BASE: '/api/user/appointments',
  CANCEL: (appointmentId: string) => `/api/user/appointments/${appointmentId}/cancel`,
  AVAILABLE_FOR_USER: '/api/user/available-slots',
  ACTIVE_APPOINTMENT: '/api/user/appointments/active',
  FEEDBACKS: '/api/user/feedbacks',
  SUBMIT_FEEDBACK: (appointmentId: string) => `/api/user/appointments/${appointmentId}/feedback`,
  PRESCRIPTION: (appointmentId: string) => `/api/user/appointments/${appointmentId}/prescription`,
  GET_APPOINTMENT_BY_ID: (appointmentId: string) => `/api/doctor/appointments/${appointmentId}`,
  CANCEL_TEMP: '/api/user/appointments/cancel-temp',
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
  CHANGE_PASSWORD: '/api/user/change-password'
};

export const DOCTOR_API = {
  BASE: '/api/doctor',
  DOCTOR_ID: (id: string) => `/api/doctor/${id}`,
  REGISTER: '/api/doctor/register',
  LOGIN: '/api/doctor/login',
  LOGOUT: '/api/doctor/logout',
  REFRESH: '/api/doctor/refresh-token',
  CHANGE_PASSWORD: '/api/doctor/change-password',
  SLOTS: '/api/doctor/slots',

  DASHBOARD: '/api/doctor/dashboard',
  DOCTORS: '/api/doctor',
  DOCTORS_PAGINATED: '/api/doctor/paginated',
  APPOINTMENTS: '/api/doctor/appointments',
  APPOINTMENTS_PAGINATED: '/api/doctor/appointments/paginated',
  APPOINTMENT_CONFIRM: (appointmentId: string) =>
    `/api/doctor/appointments/${appointmentId}/confirm`,
  APPOINTMENT_CANCEL: (appointmentId: string) => `/api/doctor/appointments/${appointmentId}/cancel`,
  ACTIVE_APPOINTMENT: '/api/doctor/appointments/active',

  PROFILE: '/api/doctor/profile',
  PROFILE_UPDATE: '/api/doctor/profile/update',
  WALLET: '/api/doctor/wallet',

  NOTIFICATIONS: '/api/doctor/notifications',
  NOTIFICATION_MARK_READ: (id: string) => `/api/doctor/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: '/api/doctor/notifications/read-all',
  NOTIFICATIONS_UNREAD_COUNT: '/api/doctor/notifications/unread-count',
  NOTIFICATION_CLEAR_ALL: '/api/doctor/notifications/clear-all',

  PATIENT_HISTORY: (patientId: string, appointmentId?: string) =>
    appointmentId
      ? `/api/doctor/patient-history/${patientId}/${appointmentId}`
      : `/api/doctor/patient-history/${patientId}`,
  PATIENT_HISTORY_BY_ID: (historyId: string) => `/api/doctor/patient-history/${historyId}`,
  PATIENT_DETAILS: (patientId: string) => `/api/doctor/patient/${patientId}`,

  REPORT_ISSUE: '/api/doctor/complaints/report',
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
  PRESENCE: (id: string) => `/api/presence/${id}`,

  SEND: '/api/chatbot/chat',
  CHATBOT_HISTORY: '/api/chatbot/history',
  CHATBOT_LATEST_SUMMARY: (userId: string) => `/api/chatbot/latest-summary/${userId}`,
};

export const USER_PROFILE_API = {
  GET: '/api/user/profile',
  UPDATE: '/api/user/profile',
  USERBY_ID: (id: string) => `/api/user/${id}`,
  WALLET: '/api/user/wallet',
  NOTIFICATIONS: '/api/user/notifications',
  NOTIFICATION_MARK_READ: (id: string) => `/api/user/notifications/${id}/read`,
  NOTIFICATION_MARK_ALL_READ: '/api/user/notifications/read-all',
  NOTIFICATIONS_UNREAD_COUNT: '/api/user/notifications/unread-count',
  NOTIFICATION_CLEAR_ALL: '/api/user/notifications/clear-all',
  REPORT_ISSUE: 'api/user/complaints/report',
};

export const SLOT_API = {
  SLOTS: '/api/slots',
};

export const BLOG_API = {
  CREATE: '/api/doctor/add-blog',
  CATEGORIES: '/api/doctor/categories',
  BY_ID: (id: string) => `/api/doctor/blogs/${id}`,
  DOCTOR_BLOGS: '/api/doctor/blogs',
  PAGINATED: (page: number, limit: number) => `/api/doctor/blogs?page=${page}&limit=${limit}`,
  UPDATE: '/api/doctor/blogs',
  GET_ALLBLOGS: '/api/user/blogs',
  GET_BLOGS: (page: number, limit: number) => `/api/user/blogs?page=${page}&limit=${limit}`,
  GET_BLOGS_BYID: (id: string) => `/api/user/blogs/${id}`,
  BLOG_COMMENTS: (id: string) => `/api/user/blogs/${id}/comments`,
  LIKE_BLOG: (id: string) => `api/user/blogs/${id}/like`,
  BLOG_LIKES: (id: string) => `api/user/blogs/${id}/likes`,

};
