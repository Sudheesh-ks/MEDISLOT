import { DoctorDTO } from './doctor.dto';
import { UserDTO } from './user.dto';

export interface AppointmentDTO {
  _id?: string;
  userData: UserDTO;
  docData: DoctorDTO;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isConfirmed?: boolean;
  isCompleted?: boolean;
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
