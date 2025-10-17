import { ioInstance } from './ChatSocket';

export async function notifyActiveAppointment(appointment: any) {
  const { userId, docId, _id, isConfirmed, cancelled, payment } = appointment;

  if (!isConfirmed || cancelled || !payment) return;

  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('active-appointment', {
      active: true,
      appointmentId: _id,
      role: 'user',
    });

    ioInstance.to(docId.toString()).emit('active-appointment', {
      active: true,
      appointmentId: _id,
      role: 'doctor',
    });
  }
}
