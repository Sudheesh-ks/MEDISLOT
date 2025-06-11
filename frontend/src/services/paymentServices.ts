import { api } from "../axios/axiosInstance"
import type { RazorpayPaymentResponse } from "../types/razorpay"

export const PaymentRazorpayAPI = async (
  appointmentId: string,
  token: string
) => {
  // ⬅️ CHANGED  /payment-razorpay → /payments/razorpay
  return api.post(
    "/api/user/payments/razorpay",               // ⬅️ CHANGED
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
  // ⬅️ CHANGED  /verifyRazorpay → /payments/razorpay/verify
  return api.post(
    "/api/user/payments/razorpay/verify",        // ⬅️ CHANGED
    {
      appointmentId,
      razorpay_order_id: response.razorpay_order_id,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};