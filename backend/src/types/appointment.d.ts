import { DoctorDocument } from '../models/DoctorModel';
import { userDocument } from '../models/UserModel';

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
  patientDetails: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    height?: string;
    weight?: string;
    problemDescription: string;
    vitals?: {
      temperature?: string;
      bloodPressure?: string;
      heartRate?: string;
    };
  };
}
