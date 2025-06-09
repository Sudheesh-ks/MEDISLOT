import { api } from "../axios/axiosInstance"
import type { RazorpayPaymentResponse } from "../types/razorpay"

export const PaymentRazorpayAPI = async (appointmentId: string, token: string) => {
    return await api.post('/api/user/payment-razorpay',
        {appointmentId},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}


export const VerifyRazorpayAPI = async (appointmentId: string, response: RazorpayPaymentResponse, token: string) => {
    return await api.post('/api/user/verifyRazorpay',
        {
            appointmentId,
            razorpay_order_id: response.razorpay_order_id
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
}