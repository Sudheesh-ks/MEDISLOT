import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { TechnicianTypes } from '../types/lab';

export interface TechnicianDocument extends Omit<TechnicianTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const technicianSchema: Schema<TechnicianDocument> = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lab',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'inactive'],
      default: 'available',
    },
  },
  { timestamps: true }
);

const technicianModel: Model<TechnicianDocument> = mongoose.model<TechnicianDocument>(
  'technician',
  technicianSchema
);

export default technicianModel;
