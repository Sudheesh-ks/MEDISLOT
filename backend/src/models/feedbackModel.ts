import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { feedbackTypes } from '../types/feedback';

export interface FeedbackDocument extends Omit<feedbackTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const feedbackSchema: Schema<FeedbackDocument> = new Schema(
  {
    userId: { type: String, ref: 'user', required: true },
    apptId: { type: String, required: true },
    doctorId: { type: String, ref: 'doctor', required: true },
    userData: { type: Object, required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const feedbackModel: Model<FeedbackDocument> = mongoose.model<FeedbackDocument>(
  'Feedback',
  feedbackSchema
);

export default feedbackModel;
