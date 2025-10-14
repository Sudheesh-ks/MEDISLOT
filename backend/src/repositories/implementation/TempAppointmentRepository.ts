import { ITempAppointmentRepository } from '../interface/ITempAppointmentRepository';
import tempAppointmentModel, { TempAppointmentDocument } from '../../models/tempAppointmentModel';
import { BaseRepository } from '../BaseRepository';

export class TempAppointmentRepository
  extends BaseRepository<TempAppointmentDocument>
  implements ITempAppointmentRepository
{
  constructor() {
    super(tempAppointmentModel);
  }

  async createTempAppointment(data: any): Promise<TempAppointmentDocument> {
    const tempAppointment = new tempAppointmentModel(data);
    return await tempAppointment.save();
  }

  async findTempAppointmentById(id: string): Promise<TempAppointmentDocument | null> {
    return await tempAppointmentModel.findById(id);
  }

  async findTempAppointmentByOrderId(orderId: string): Promise<TempAppointmentDocument | null> {
    return await tempAppointmentModel.findOne({ razorpayOrderId: orderId });
  }

  async findActiveTempAppointment(
    docId: string,
    slotDate: string,
    slotStartTime: string,
    slotEndTime: string
  ): Promise<TempAppointmentDocument | null> {
    return await tempAppointmentModel.findOne({
      docId,
      slotDate,
      slotStartTime,
      slotEndTime,
      status: 'pending_payment',
      expiresAt: { $gt: new Date() },
    });
  }

  async updateTempAppointmentStatus(
    id: string,
    status: 'pending_payment' | 'cancelled' | 'expired'
  ): Promise<void> {
    await tempAppointmentModel.findByIdAndUpdate(id, { status });
  }

  async deleteTempAppointment(id: string): Promise<void> {
    await tempAppointmentModel.findByIdAndDelete(id);
  }

  async findUserTempAppointments(userId: string): Promise<TempAppointmentDocument[]> {
    return await tempAppointmentModel.find({ userId, status: 'pending_payment' });
  }

  async cleanupExpiredTempAppointments(): Promise<number> {
    const result = await tempAppointmentModel.deleteMany({
      $or: [{ expiresAt: { $lt: new Date() } }, { status: 'expired' }],
    });
    return result.deletedCount || 0;
  }
}
