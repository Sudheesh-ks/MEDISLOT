import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PrescriptionTestTypes } from '../types/lab';

export interface PrescriptionTestDocument extends Omit<PrescriptionTestTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const prescriptionTestSchema: Schema<PrescriptionTestDocument> = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'doctor',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'appointment',
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    preferredLabId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lab',
      default: null,
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'critical'],
      default: 'routine',
    },
    status: {
      type: String,
      enum: ['pending', 'booked', 'completed'],
      default: 'pending',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'labBooking',
      default: null,
    },
  },
  { timestamps: true }
);

const prescriptionTestModel: Model<PrescriptionTestDocument> =
  mongoose.model<PrescriptionTestDocument>('prescriptionTest', prescriptionTestSchema);

export default prescriptionTestModel;
