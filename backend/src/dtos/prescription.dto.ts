export interface PrescriptionDTO {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  prescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}
