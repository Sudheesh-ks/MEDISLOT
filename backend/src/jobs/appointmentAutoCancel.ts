import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel';
import { adminService } from '../dependencyHandlers/admin.dependencies';

// This job runs every hour to check for stale unconfirmed appointments
export function startStaleAppointmentCleaner() {
    cron.schedule('0 * * * *', async () => {
        console.log('Running stale appointment cleaner job...');

        // We want to cancel appointments unconfirmed for more than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        try {
            // Find appointments that are:
            // 1. Paid (payment: true)
            // 2. Not confirmed (isConfirmed: false)
            // 3. Not already cancelled (cancelled: false)
            // 4. Older than 24 hours (createdAt < twentyFourHoursAgo)
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
                        // Use the existing cancelAppointment logic which handles:
                        // - Refund to user wallet
                        // - Debit from doctor/admin wallets (if they were credited, though here it's likely pending)
                        // - Notifications (to user and doctor)
                        // - Real-time socket updates
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
