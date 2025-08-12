import { Types } from 'mongoose';

export interface prescriptionTypes {
  _id: Types.ObjectId;
  appointmentId: Types.ObjectId;
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  prescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}
