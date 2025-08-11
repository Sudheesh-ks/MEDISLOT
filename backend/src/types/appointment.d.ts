import { DoctorDocument } from '../models/doctorModel';
import { userDocument } from '../models/userModel';

export interface AppointmentTypes {
  _id?: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  userData: userDocument;
  docData: DoctorDocument;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isConfirmed?: boolean;
  isCompleted?: boolean;
  razorpayOrderId?: string | null;
}
