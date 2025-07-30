import type { DoctorProfileType } from './doctor';
import type { userData } from './user';

export interface AppointmentTypes {
  _id?: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  userData: userData;
  docData: DoctorProfileType;
  amount: number;
  date: Date;
  cancelled?: boolean;
  payment?: boolean;
  isConfirmed?: boolean;
  isCompleted?: boolean;
}
