export interface AppointmentTypes {
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: Record<string, any>;
  docData: Record<string, any>;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isConfirmed?: boolean;
  isCompleted?: boolean;
  razorpayOrderId?: string | null;
}


export interface AppointmentDocument
  extends AppointmentTypes, Document {
  _id: Types.ObjectId;
}
