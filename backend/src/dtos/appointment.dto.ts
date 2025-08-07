import { DoctorDTO } from "./doctor.dto";
import { UserDTO } from "./user.dto";

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
}
