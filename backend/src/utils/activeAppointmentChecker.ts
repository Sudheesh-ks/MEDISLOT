import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel';
import { ioInstance } from '../sockets/ChatSocket';

const emitted = new Set<string>();

cron.schedule('* * * * *', async () => {
  if (!ioInstance) return;

  const now = new Date();

  try {
    const appointments = await appointmentModel.find({
      payment: true,
      cancelled: false,
      isConfirmed: true,
    });

    for (const appt of appointments) {
      const start = new Date(`${appt.slotDate}T${appt.slotStartTime}:00`);
      const end = new Date(`${appt.slotDate}T${appt.slotEndTime}:00`);

      if (now >= start && now <= end) {
        if (!emitted.has(appt._id.toString())) {
          ioInstance.to(appt.userId.toString()).emit('active-appointment', {
            appointmentId: appt._id,
          });
          ioInstance.to(appt.docId.toString()).emit('active-appointment', {
            appointmentId: appt._id,
          });

          console.log(`Active appointment emitted: ${appt._id}`);
          emitted.add(appt._id.toString());
        }
      } else if (now > end) {
        emitted.delete(appt._id.toString());
      }
    }
  } catch (err) {
    console.error('Error checking active appointments:', err);
  }
});
