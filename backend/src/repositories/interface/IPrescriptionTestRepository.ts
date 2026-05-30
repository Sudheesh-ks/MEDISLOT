import { PrescriptionTestDocument } from '../../models/prescriptionTestModel';
import { PrescriptionTestTypes } from '../../types/lab';

export interface IPrescriptionTestRepository {
  createPrescriptionTest(data: Partial<PrescriptionTestTypes>): Promise<PrescriptionTestDocument>;
  findById(id: string): Promise<PrescriptionTestDocument | null>;
  findByAppointmentId(appointmentId: string): Promise<PrescriptionTestDocument[]>;
  findByUserId(userId: string): Promise<PrescriptionTestDocument[]>;
  updateStatus(id: string, status: 'pending' | 'booked' | 'completed', bookingId?: string): Promise<void>;
}
