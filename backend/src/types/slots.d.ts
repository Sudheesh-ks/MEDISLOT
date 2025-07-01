import { Document } from "mongoose";


export interface SlotDocument extends Document {
  doctorId: Object;
  date: string; 
  slots: {
    isAvailable: boolean; start: string; end: string; booked: boolean 
}[];
  isCancelled: boolean;
}


// src/types/slots.ts  (or similar)
export interface SlotRange {
  start: string;
  end: string;
  isAvailable: boolean;
  booked: boolean;
}
