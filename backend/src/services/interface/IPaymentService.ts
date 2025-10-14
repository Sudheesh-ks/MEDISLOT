import { RazorpayOrderDTO } from '../../types/payment';

export interface IPaymentService {
  createOrder(amountPaise: number, receipt: string): Promise<RazorpayOrderDTO>;
  fetchOrder(razorpay_order_id: string): Promise<RazorpayOrderDTO>;
}
