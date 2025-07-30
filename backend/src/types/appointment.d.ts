import { Types } from "mongoose";
import { DoctorAppntTypes, DoctorTypes } from "./doctor";
import { UserAppntTypes, userTypes } from "./user";
import { DoctorDocument } from "../models/doctorModel";
import { userDocument } from "../models/userModel";

export interface AppointmentTypes {
  _id?: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
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
