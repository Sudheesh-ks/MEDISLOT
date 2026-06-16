import { userApi } from '../axios/AxiosInstance';
import { PAYMENT_API } from '../constants/ApiRoutes';
import type { RazorpayPaymentResponse } from '../types/Razorpay';

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
