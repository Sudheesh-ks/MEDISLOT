import { PatientHistoryDocument } from '../../models/patientHistoryModel';

export interface IPatientHistoryRepository {
  createHistory(history: Partial<PatientHistoryDocument>): Promise<PatientHistoryDocument>;
  findHistoryById(id: string): Promise<PatientHistoryDocument | null>;
  findByDoctorAndPatient(doctorId: string, userId: string): Promise<PatientHistoryDocument[]>;
  findPrescriptionByAppointmentId(appointmentId: string): Promise<PatientHistoryDocument | null>;
  updateHistory(
    id: string,
    data: Partial<PatientHistoryDocument>
  ): Promise<PatientHistoryDocument | null>;
}
