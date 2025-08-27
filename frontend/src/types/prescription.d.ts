interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionData {
  appointmentId: string;
  doctor: { name: string; email: string };
  patient: { name: string; email: string };
  prescription: PrescriptionItem[];
  createdAt: string;
}
