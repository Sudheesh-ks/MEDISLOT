import { api } from "../axios/axiosInstance"
import type { RazorpayPaymentResponse } from "../types/razorpay"

export const PaymentRazorpayAPI = async (
  appointmentId: string,
  token: string
) => {
  return api.post(
    "/api/user/payments/razorpay",               
    { appointmentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Verify Razorpay signature
export const VerifyRazorpayAPI = async (
  appointmentId: string,
  response: RazorpayPaymentResponse,
  token: string
) => {
  return api.post(
    "/api/user/payments/razorpay/verify",      
    {
      appointmentId,
      razorpay_order_id: response.razorpay_order_id,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};