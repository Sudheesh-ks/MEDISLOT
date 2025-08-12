import { prescriptionDocument } from '../../models/prescriptionModel';
import { prescriptionTypes } from '../../types/prescription';

export interface IPrescriptionRepository {
  createPrescription(data: Partial<prescriptionDocument>): Promise<prescriptionDocument>;
  findByAppointmentId(appointmentId: string): Promise<prescriptionDocument | null>;
  updatePrescriptionById(id: string, data: Partial<prescriptionTypes>): Promise<void>;
}
