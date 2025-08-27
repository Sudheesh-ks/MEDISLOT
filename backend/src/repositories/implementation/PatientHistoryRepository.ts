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
    return this.findAll({ doctorId, userId });
  }

  async findPrescriptionByAppointmentId(
    appointmentId: string
  ): Promise<PatientHistoryDocument | null> {
    return (
      patientHistoryModel
        .findOne({ appointmentId })
        // .populate("patientId", "name email")
        .populate('doctorId', 'name email')
        .exec()
    );
  }
}
