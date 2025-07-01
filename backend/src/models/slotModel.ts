import mongoose, { Schema } from "mongoose";
import { SlotDocument } from "../types/slots";

const SlotSchema = new Schema<SlotDocument>({
  doctorId: { type: Schema.Types.ObjectId, ref: "doctor", required: true },
  date: { type: String, required: true },
  slots:    [
   {
     start:       { type: String, required: true },        // HH:mm
     end:         { type: String, required: true },        // HH:mm
     isAvailable: { type: Boolean, default: true },        // doctor toggle
     booked:      { type: Boolean, default: false },       // patient booking flag (future‑proof)
   },
 ],
  isCancelled: { type: Boolean, default: false },
});

export default mongoose.model<SlotDocument>("slot", SlotSchema);