interface Vitals {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  oxygenSaturation?: string;
}

export interface PatientHistoryTypes {
  date: string;
  time: string;
  type: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals: Vitals;
  diagnosis: string;
  doctorNotes: string;
  prescription: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}
