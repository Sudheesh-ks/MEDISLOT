export interface PrescriptionDTO {
  id: string;
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
  prescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}
