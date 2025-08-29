import { PrescriptionDTO } from '../dtos/prescription.dto';

export const toPrescriptionDTO = (doc: any): PrescriptionDTO => {
  return {
    appointmentId: doc.appointmentId.toString(),
    doctor: {
      id: doc.doctorId._id.toString(),
      name: doc.doctorId.name,
      email: doc.doctorId.email,
    },
    patient: {
      id: doc.patientId._id.toString(),
      name: doc.patientId.name,
      email: doc.patientId.email,
    },
    prescription: doc.prescription,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
