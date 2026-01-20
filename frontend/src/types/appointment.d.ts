import type { DoctorProfileType } from './doctor';
import type { userData } from './user';

export interface AppointmentTypes {
  _id: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  userData: userData;
  docData: DoctorProfileType;
  amount: number;
  date: number;
  cancelled: boolean;
  payment: boolean;
  isConfirmed: boolean;
  isCompleted: boolean;
  patientDetails: {
    name: string;
    age: number;
    gender: string;
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
