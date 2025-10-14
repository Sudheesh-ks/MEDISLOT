import mongoose, { Document, Schema, Model } from 'mongoose';

export interface TempAppointmentTypes {
  _id?: string;
  userId: string;
  docId: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  userData: any;
  docData: any;
  amount: number;
  razorpayOrderId: string;
  status: 'pending_payment' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface TempAppointmentDocument extends Omit<TempAppointmentTypes, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const tempAppointmentSchema: Schema<TempAppointmentDocument> = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    docId: {
      type: String,
      required: true,
    },
    slotDate: {
      type: String,
      required: true,
    },
    slotStartTime: {
      type: String,
      required: true,
    },
    slotEndTime: {
      type: String,
      required: true,
    },
    userData: {
      type: Object,
      required: true,
    },
    docData: {
      type: Object,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_payment', 'cancelled', 'expired'],
      default: 'pending_payment',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tempAppointmentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

tempAppointmentSchema.index({ docId: 1, slotDate: 1, slotStartTime: 1, slotEndTime: 1 });
tempAppointmentSchema.index({ userId: 1, status: 1 });
tempAppointmentSchema.index({ razorpayOrderId: 1 });

const tempAppointmentModel: Model<TempAppointmentDocument> =
  mongoose.model<TempAppointmentDocument>('tempAppointment', tempAppointmentSchema);

export default tempAppointmentModel;
