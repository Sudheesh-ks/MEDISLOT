import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { LabVerificationTypes } from '../types/lab';

export interface LabVerificationDocument extends Omit<LabVerificationTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const labVerificationSchema: Schema<LabVerificationDocument> = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lab',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const labVerificationModel: Model<LabVerificationDocument> = mongoose.model<LabVerificationDocument>(
  'labVerification',
  labVerificationSchema
);

export default labVerificationModel;
