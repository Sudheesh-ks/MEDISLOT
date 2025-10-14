import { TempAppointmentDocument } from '../../models/tempAppointmentModel';

export interface ITempAppointmentRepository {
  createTempAppointment(data: any): Promise<TempAppointmentDocument>;
  findTempAppointmentById(id: string): Promise<TempAppointmentDocument | null>;
  findTempAppointmentByOrderId(orderId: string): Promise<TempAppointmentDocument | null>;
  findActiveTempAppointment(
    docId: string,
    slotDate: string,
    slotStartTime: string,
    slotEndTime: string
  ): Promise<TempAppointmentDocument | null>;
  updateTempAppointmentStatus(
    id: string,
    status: 'pending_payment' | 'cancelled' | 'expired'
  ): Promise<void>;
  deleteTempAppointment(id: string): Promise<void>;
  findUserTempAppointments(userId: string): Promise<TempAppointmentDocument[]>;
  cleanupExpiredTempAppointments(): Promise<number>;
}
