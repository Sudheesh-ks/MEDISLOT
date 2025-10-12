import Razorpay from 'razorpay';
import { IPaymentService } from '../interface/IPaymentService';
import { RazorpayOrderDTO } from '../../types/payment';

export class PaymentService implements IPaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amountPaise: number, receipt: string): Promise<RazorpayOrderDTO> {
    const order = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: process.env.CURRENCY || 'INR',
      receipt,
    });

    return order as RazorpayOrderDTO;
  }

  async fetchOrder(razorpay_order_id: string): Promise<RazorpayOrderDTO> {
    const order = await this.razorpay.orders.fetch(razorpay_order_id);
    return order as RazorpayOrderDTO;
  }
}
