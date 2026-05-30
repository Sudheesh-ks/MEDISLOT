import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ReviewTypes } from '../types/lab';

export interface ReviewDocument extends Omit<ReviewTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const reviewSchema: Schema<ReviewDocument> = new mongoose.Schema(
  {
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
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'labBooking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const reviewModel: Model<ReviewDocument> = mongoose.model<ReviewDocument>('labReview', reviewSchema);

export default reviewModel;
