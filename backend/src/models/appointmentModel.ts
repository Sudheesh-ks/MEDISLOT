import mongoose, { Schema, Model, Document, Types } from "mongoose";
import { AppointmentTypes } from "../types/appointment";

export interface AppointmentDocument extends Omit<AppointmentTypes, "_id">, Document {
  _id: Types.ObjectId
}

const appointmentSchema: Schema<AppointmentDocument> = new mongoose.Schema({
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

  slotTime: {
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

  date: {
    type: Number,
    required: true,
  },

  cancelled: {
    type: Boolean,
    default: false,
  },

  payment: {
    type: Boolean,
    default: false,
  },

  isConfirmed: {
    type: Boolean,
    default: false,
  },

  isCompleted: {
    type: Boolean,
    default: false,
  },

  razorpayOrderId: {
  type: String,
  default: null,
},
},
  {
    timestamps: true, 
  }
);

const appointmentModel: Model<AppointmentDocument> =
  mongoose.model<AppointmentDocument>("appointment", appointmentSchema);

export default appointmentModel;
