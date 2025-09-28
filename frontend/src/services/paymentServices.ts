import { userApi } from '../axios/axiosInstance';
import { PAYMENT_API } from '../constants/apiRoutes';
import type { RazorpayPaymentResponse } from '../types/razorpay';

// Initiate Razorpay payment
export const PaymentRazorpayAPI = async (appointmentId: string) => {
  return userApi.post(PAYMENT_API.RAZORPAY_INIT, { appointmentId });
};

// Verify Razorpay payment signature
export const VerifyRazorpayAPI = async (
  appointmentId: string,
  response: RazorpayPaymentResponse
) => {
  return userApi.post(PAYMENT_API.RAZORPAY_VERIFY, {
    appointmentId,
    razorpay_order_id: response.razorpay_order_id,
  });
};
