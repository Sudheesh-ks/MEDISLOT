import { api } from "../axios/axiosInstance";
import { PAYMENT_API } from "../constants/apiRoutes";
import type { RazorpayPaymentResponse } from "../types/razorpay";

// Initiate Razorpay payment
export const PaymentRazorpayAPI = async (
  appointmentId: string,
  token: string
) => {
  return api.post(
    PAYMENT_API.RAZORPAY_INIT,
    { appointmentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Verify Razorpay payment signature
export const VerifyRazorpayAPI = async (
  appointmentId: string,
  response: RazorpayPaymentResponse,
  token: string
) => {
  return api.post(
    PAYMENT_API.RAZORPAY_VERIFY,
    {
      appointmentId,
      razorpay_order_id: response.razorpay_order_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
