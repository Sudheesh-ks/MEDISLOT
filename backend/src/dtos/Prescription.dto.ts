export interface PrescriptionDTO {
  appointmentId: string;
  doctor: {
    id: string;
    name: string;
    email: string;
  };
  patient: {
    id: string;
    name: string;
    email: string;
  };
  prescription: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
