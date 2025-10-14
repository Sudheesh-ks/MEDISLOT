import { userApi } from '../axios/axiosInstance';
import { PAYMENT_API } from '../constants/apiRoutes';
import type { RazorpayPaymentResponse } from '../types/razorpay';

// Initiate Razorpay payment
export const PaymentRazorpayAPI = async (appointmentId: string) => {
  return userApi.post(PAYMENT_API.RAZORPAY_INIT, { appointmentId });
};

// Verify Razorpay payment signature
export const VerifyRazorpayAPI = async (
  tempBookingId: string,
  response: RazorpayPaymentResponse
) => {
  return userApi.post(PAYMENT_API.RAZORPAY_VERIFY, {
    appointmentId: tempBookingId,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
};

export const cancelTempBookingAPI = async (tempBookingId: string) => {
  return userApi.post('/api/user/appointments/cancel-temp', { tempBookingId });
};
