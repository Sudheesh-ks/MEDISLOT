import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { LabReportTypes } from '../types/lab';

export interface LabReportDocument extends Omit<LabReportTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const labReportSchema: Schema<LabReportDocument> = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'labBooking',
      required: true,
      unique: true, // Only one report per booking
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
    reportFile: {
      type: String,
      required: true, // Cloudinary PDF URL
    },
    comments: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    digitallySigned: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const labReportModel: Model<LabReportDocument> = mongoose.model<LabReportDocument>(
  'labReport',
  labReportSchema
);

export default labReportModel;
