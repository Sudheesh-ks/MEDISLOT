// import mongoose, { Schema, Document, Model, Types } from 'mongoose';
// import { prescriptionTypes } from '../types/prescription';

// export interface prescriptionDocument extends Omit<prescriptionTypes, '_id'>, Document {
//   _id: Types.ObjectId;
// }

// const prescriptionSchema: Schema<prescriptionDocument> = new mongoose.Schema(
//   {
//     appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
//     doctorId: { type: Schema.Types.ObjectId, ref: 'doctor', required: true },
//     patientId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
//     prescription: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const prescriptionModel: Model<prescriptionDocument> = mongoose.model<prescriptionDocument>(
//   'Prescription',
//   prescriptionSchema
// );

// export default prescriptionModel;
