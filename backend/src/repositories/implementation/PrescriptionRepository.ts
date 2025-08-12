import { IPrescriptionRepository } from '../interface/IPrescriptionRepository';
import prescriptionModel, { prescriptionDocument } from '../../models/prescriptionModel';
import { BaseRepository } from '../BaseRepository';
import { prescriptionTypes } from '../../types/prescription';

export class PrescriptionRepository
  extends BaseRepository<prescriptionDocument>
  implements IPrescriptionRepository
{
  constructor() {
    super(prescriptionModel);
  }

  async createPrescription(data: Partial<prescriptionDocument>): Promise<prescriptionDocument> {
    console.log(data);
    const createdPrescription = await this.create(data);
    return createdPrescription as prescriptionDocument;
  }

  async findByAppointmentId(appointmentId: string): Promise<prescriptionDocument | null> {
    return this.findOne({ appointmentId });
  }

  async updatePrescriptionById(id: string, data: Partial<prescriptionTypes>): Promise<void> {
    await prescriptionModel.findByIdAndUpdate(id, { $set: data });
  }
}
