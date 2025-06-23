import { Document } from "mongoose";


export interface SlotDocument extends Document {
  doctorId: Object;
  date: string; 
  slots: { start: string; end: string; booked: boolean }[];
  isCancelled: boolean;
}