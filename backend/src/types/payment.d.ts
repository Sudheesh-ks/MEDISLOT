export interface RazorpayOrderPayload {
  fees: number;
  currency: 'INR';
  receipt: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
}

export interface RazorpayOrderDTO {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
}
