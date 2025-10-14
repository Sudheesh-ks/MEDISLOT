import mongoose, { Schema, Types, Document } from 'mongoose';
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
  },

  weekday: { type: Number },

  slots: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
      booked: { type: Boolean, default: false },
      locked: { type: Boolean, default: false },
      lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      lockExpiresAt: { type: Date, default: null },
    },
  ],
  isCancelled: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model<SlotDocument>('slot', SlotSchema);
