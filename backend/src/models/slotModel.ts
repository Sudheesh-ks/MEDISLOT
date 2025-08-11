import mongoose, { Schema, Types } from 'mongoose';
import { slotTypes } from '../types/slots';

export interface SlotDocument extends Omit<slotTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const SlotSchema: Schema<SlotDocument> = new mongoose.Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'doctor',
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  slots: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
      booked: { type: Boolean, default: false },
    },
  ],
  isCancelled: { type: Boolean, default: false },
});

export default mongoose.model<SlotDocument>('slot', SlotSchema);
