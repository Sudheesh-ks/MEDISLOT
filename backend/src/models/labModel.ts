import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { LabTypes } from '../types/lab';

export interface LabDocument extends Omit<LabTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const labSchema: Schema<LabDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    accreditation: {
      type: String,
      required: true,
    },
    address: {
      fullAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    licenseCertificate: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    ownerIdProof: {
      type: String,
      required: true,
    },
    accreditationCertificate: {
      type: String,
      required: true,
    },
    workingDays: {
      type: [String],
      required: true,
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    homeCollection: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'blocked'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false, timestamps: true }
);

// GeoJSON 2dsphere index for nearby lab searches
labSchema.index({ location: '2dsphere' });

const labModel: Model<LabDocument> = mongoose.model<LabDocument>('lab', labSchema);

export default labModel;
