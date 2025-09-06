import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ComplaintTypes } from '../types/complaint';

export interface ComplaintDocument extends Omit<ComplaintTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const complaintSchema: Schema<ComplaintDocument> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'doctor',
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

const ComplaintModel: Model<ComplaintDocument> = mongoose.model<ComplaintDocument>(
  'complaint',
  complaintSchema
);

export default ComplaintModel;
