import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { LabBookingTypes } from '../types/lab';

export interface LabBookingDocument extends Omit<LabBookingTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const labBookingSchema: Schema<LabBookingDocument> = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lab',
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'labService',
        required: true,
      },
    ],
    bookingDate: {
      type: String,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    homeCollection: {
      type: Boolean,
      default: false,
    },
    address: {
      fullAddress: { type: String },
      city: { type: String },
      pincode: { type: String },
      phone: { type: String },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'wallet', 'cod'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'sample_collected',
        'processing',
        'report_ready',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'technician',
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    prescriptionTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'prescriptionTest',
      default: null,
    },
  },
  { timestamps: true }
);

const labBookingModel: Model<LabBookingDocument> = mongoose.model<LabBookingDocument>(
  'labBooking',
  labBookingSchema
);

export default labBookingModel;
