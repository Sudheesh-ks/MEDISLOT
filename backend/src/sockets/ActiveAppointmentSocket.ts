import { ioInstance } from './ChatSocket';

export async function notifyActiveAppointment(appointment: any) {
  const { userId, docId, _id } = appointment;

  if (ioInstance) {
    // Notify user
    ioInstance.to(userId).emit('active-appointment', {
      appointmentId: _id,
      role: 'user',
    });

    // Notify doctor
    ioInstance.to(docId).emit('active-appointment', {
      appointmentId: _id,
      role: 'doctor',
    });
  }
}
