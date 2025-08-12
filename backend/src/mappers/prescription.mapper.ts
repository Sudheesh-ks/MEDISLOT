import { PrescriptionDTO } from '../dtos/prescription.dto';
import { prescriptionDocument } from '../models/prescriptionModel';

export const toPrescriptionDTO = (doc: prescriptionDocument): PrescriptionDTO => {
  return {
    id: doc._id.toString(),
    appointmentId: doc.appointmentId.toString(),
    doctorId: doc.doctorId.toString(),
    patientId: doc.patientId.toString(),
    prescription: doc.prescription,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};
