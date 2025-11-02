export const HttpResponse = {
  // General
  OK: 'OK',
  SERVER_ERROR: 'Internal server error',
  CREATED: 'Created successfully',
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',

  // Auth related
  FIELDS_REQUIRED: 'All fields are required',
  INVALID_NAME: 'Name should contain 4 - 20 characters',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD:
    'Password must be at least 8 characters long, contain at least 1 letter, 1 number, and 1 special character',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INCORRECT_PASSWORD: 'Incorrect Password',
  PASSWORD_UPDATED: 'Password updated successfully',
  EMAIL_ALREADY_EXISTS: 'This email already exists',
  REGISTER_SUCCESS: 'Registered successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',

  // Profile related
  PROFILE_UPDATED: 'Profile updated successfully',

  // Refresh token related
  REFRESH_TOKEN_MISSING: 'No refresh token provided',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  REFRESH_TOKEN_FAILED: 'Token verification failed',

  // User related
  USER_NOT_FOUND: 'User not found',
  DOCTOR_FEEDBACK: 'Feedback updated successfully',

  //   Admin related
  BLOCK_STATUS_INVALID: 'Block status is required and must be a boolean',
  USER_BLOCK: 'User blocked successfully',
  USER_UNBLOCK: 'User unblocked successfully',

  //   Doctor related
  SLOT_CREATED: 'Slot created successfully',
  SLOT_DELETED: 'Slot removed successfully',
  SLOT_UPDATED: 'Slot updated successfully',

  // OTP
  OTP_SENT: 'OTP sent to email',
  OTP_SEND_FAILED: 'OTP sending failed',
  OTP_INVALID: 'Invalid OTP',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_RESENT: 'OTP resent successfully',
  OTP_NOT_FOUND: 'No pending OTP found',
  OTP_EXPIRED_OR_INVALID: 'OTP not verified or expired',

  // Appointment
  APPOINTMENT_BOOKED: 'Appointment Booked',
  APPOINTMENT_CANCELLED: 'Appointment Cancelled',
  APPOINTMENT_CONFIRMED: 'Appointment Confirmed',

  // Payment
  PAYMENT_SUCCESS: 'Payment successful',
  PAYMENT_FAILED: 'Payment transaction failed',
};
