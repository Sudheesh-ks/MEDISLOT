import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel';
import { adminService } from '../dependencyHandlers/admin.dependencies';

export function startStaleAppointmentCleaner() {
    cron.schedule('0 * * * *', async () => {
        
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        try {
            const staleAppointments = await appointmentModel.find({
                payment: true,
                isConfirmed: false,
                cancelled: false,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            if (staleAppointments.length > 0) {
                console.log(`Found ${staleAppointments.length} stale appointments to auto-cancel.`);

                for (const appt of staleAppointments) {
                    try {
                        await adminService.cancelAppointment(appt._id.toString());
                        console.log(`Auto-cancelled appointment: ${appt._id}`);
                    } catch (err) {
                        console.error(`Failed to auto-cancel appointment ${appt._id}:`, err);
                    }
                }
            }
        } catch (error) {
            console.error('Error in stale appointment cleaner job:', error);
        }
    });
}
