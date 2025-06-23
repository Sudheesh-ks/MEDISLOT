import mongoose, { Schema } from "mongoose";
import { SlotDocument } from "../types/slots";

const SlotSchema = new Schema<SlotDocument>({
  doctorId: { type: Schema.Types.ObjectId, ref: "doctor", required: true },
  date: { type: String, required: true },
  slots: [{ start: String, end: String, booked: { type: Boolean, default: false } }],
  isCancelled: { type: Boolean, default: false },
});

export default mongoose.model<SlotDocument>("slot", SlotSchema);