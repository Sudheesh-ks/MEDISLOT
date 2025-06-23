import Razorpay from "razorpay";

export interface RazorpayOrderPayload {
  fees: number;
  currency: "INR";
  receipt: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
}

export class PaymentService {
  private razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  async createOrder(amountPaise: number, receipt: string) {
    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: process.env.CURRENCY || "INR",
      receipt,
    });
    return order;
  }

  async fetchOrder(razorpay_order_id: string) {
    return await this.razorpay.orders.fetch(razorpay_order_id);
  }
}
