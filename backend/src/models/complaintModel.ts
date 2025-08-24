// models/complaint.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ComplaintTypes } from '../types/complaint';

// Document interface (with _id added separately)
export interface ComplaintDocument extends Omit<ComplaintTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

// Schema
const complaintSchema: Schema<ComplaintDocument> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const ComplaintModel: Model<ComplaintDocument> = mongoose.model<ComplaintDocument>(
  'complaint',
  complaintSchema
);

export default ComplaintModel;
