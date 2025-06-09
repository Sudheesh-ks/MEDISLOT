/* src/types/razorpay.d.ts  – browser-side Razorpay typings  */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;          // paise
  currency: string;        // “INR”, “USD” …
  name: string;
  description?: string;
  order_id: string;
  receipt?: string;
  handler?: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
}

export declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
}

declare global {
  interface Window {
    Razorpay: typeof Razorpay;
  }
}
