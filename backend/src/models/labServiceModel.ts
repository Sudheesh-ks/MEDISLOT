import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { LabServiceTypes } from '../types/lab';

export interface LabServiceDocument extends Omit<LabServiceTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const labServiceSchema: Schema<LabServiceDocument> = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'lab',
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Blood Test',
        'Thyroid',
        'Diabetes',
        'MRI',
        'CT Scan',
        'X-Ray',
        'Urine Test',
        'Full Body Checkup',
        'ECG',
        'Covid Tests',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    preparation: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    reportTime: {
      type: String,
      required: true,
    },
    homeCollection: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Search indexing for text search on tests
labServiceSchema.index({ testName: 'text', category: 'text' });

const labServiceModel: Model<LabServiceDocument> = mongoose.model<LabServiceDocument>(
  'labService',
  labServiceSchema
);

export default labServiceModel;
