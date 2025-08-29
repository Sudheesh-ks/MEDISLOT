import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { patientHistoryTypes } from '../types/patientHistoryTypes';

export interface PatientHistoryDocument extends Omit<patientHistoryTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const patientHistorySchema: Schema<PatientHistoryDocument> = new mongoose.Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'appointment',
      required: true,
      unique: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'doctor',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Regular Checkup', 'Follow-up', 'Emergency', 'Consultation', 'Procedure'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    chiefComplaint: {
      type: String,
      required: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    vitals: {
      bloodPressure: { type: String, default: null },
      heartRate: { type: String, default: null },
      temperature: { type: String, default: null },
      weight: { type: String, default: null },
      height: { type: String, default: null },
      oxygenSaturation: { type: String, default: null },
    },
    diagnosis: {
      type: String,
      required: true,
    },
    prescription: [
      {
        medication: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, required: true },
      },
    ],
    doctorNotes: {
      type: String,
      default: '',
    },
    nextAppointment: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const patientHistoryModel: Model<PatientHistoryDocument> = mongoose.model<PatientHistoryDocument>(
  'PatientHistory',
  patientHistorySchema
);

export default patientHistoryModel;
