import patientHistoryModel, { PatientHistoryDocument } from '../../models/patientHistoryModel';
import { BaseRepository } from '../BaseRepository';
import { IPatientHistoryRepository } from '../interface/IPatientHistoryRepository';

export class PatientHistoryRepository
  extends BaseRepository<PatientHistoryDocument>
  implements IPatientHistoryRepository
{
  constructor() {
    super(patientHistoryModel);
  }

  async createHistory(history: Partial<PatientHistoryDocument>): Promise<PatientHistoryDocument> {
    const created = await this.create(history);
    return created as PatientHistoryDocument;
  }

  async findHistoryById(id: string): Promise<PatientHistoryDocument | null> {
    const history = await this.findById(id);
    return history ? (history as PatientHistoryDocument) : null;
  }

  async findByDoctorAndPatient(
    doctorId: string,
    userId: string
  ): Promise<PatientHistoryDocument[]> {
    return this.model.find({ doctorId, userId }).sort({ createdAt: -1 }).lean();
  }

  async findPrescriptionByAppointmentId(
    appointmentId: string
  ): Promise<PatientHistoryDocument | null> {
    return patientHistoryModel.findOne({ appointmentId }).populate('doctorId', 'name email').exec();
  }

  async updateHistory(
    id: string,
    data: Partial<PatientHistoryDocument>
  ): Promise<PatientHistoryDocument | null> {
    const updated = await patientHistoryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return updated ? (updated as PatientHistoryDocument) : null;
  }
}
