import cron from 'node-cron';
import { appointmentService } from '../dependencyHandlers/Appointment.dependency';

export function startStaleAppointmentCleaner() {
  cron.schedule('0 * * * *', async () => {
    try {
      await appointmentService.autoCancelStaleAppointments();
    } catch (error) {
      console.error('Error in stale appointment cleaner job:', error);
    }
  });
}
