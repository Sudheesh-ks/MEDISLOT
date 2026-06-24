import { Types } from 'mongoose';

export interface patientHistoryTypes {
  appointmentId: string | Types.ObjectId;
  patientId: string | Types.ObjectId;
  doctorId: string | Types.ObjectId;
  date: Date;
  time: string;
  type: string;
  status?: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
    oxygenSaturation?: string;
  };
  diagnosis: string;
  prescription?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  doctorNotes?: string;
  nextAppointment?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
