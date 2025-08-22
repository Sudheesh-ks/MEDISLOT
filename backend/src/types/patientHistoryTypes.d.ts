import { Types } from 'mongoose';

export interface patientHistoryTypes {
  patientId: string | Types.ObjectId; // Reference to user
  doctorId: string | Types.ObjectId; // Reference to doctor
  date: Date; // Session date
  time: string; // Session time (e.g., "10:30 AM")
  type: string; // Visit type (e.g., "Regular Checkup")
  status?: string; // Session status (e.g., "Completed")
  chiefComplaint: string; // Main reason for the visit
  symptoms: string[]; // List of symptoms
  vitals: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    weight?: string;
    height?: string;
    oxygenSaturation?: string;
  }; // Vital signs
  diagnosis: string; // Diagnosis details
  prescription?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[]; // Array of structured prescriptions
  doctorNotes?: string; // Doctor's notes
  nextAppointment?: Date; // Date of next appointment
  createdAt?: Date;
  updatedAt?: Date;
}
