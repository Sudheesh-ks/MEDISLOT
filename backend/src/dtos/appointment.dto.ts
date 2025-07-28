import { AppointmentTypes } from "../types/appointment";
import { DoctorAppntTypes } from "../types/doctor";
import { UserAppntTypes } from "../types/user";
import { DoctorDTO } from "./doctor.dto";
import { UserDTO } from "./user.dto";


export interface AppointmentDTO {
  _id?: string;
  userData: UserDTO;
  docData: DoctorDTO;
  slotDate: string;
  slotTime: string;
  amount: number;
  date: number;
  cancelled?: boolean;
  payment?: boolean;
  isConfirmed?: boolean;
  isCompleted?: boolean;
}

