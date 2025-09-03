import express from 'express';
import authRole from '../middlewares/authRole';

// Dependency layers
import { AdminRepository } from '../repositories/implementation/AdminRepository';
import { AdminService } from '../services/implementation/AdminService';
import { AdminController } from '../controllers/implementation/AdminController';

import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { NotificationService } from '../services/implementation/NotificationService';
import { FeedbackRepository } from '../repositories/implementation/FeedbackRepository';
import { ComplaintRepository } from '../repositories/implementation/ComplaintRepository';

// Admin Layer
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const walletRepository = new WalletRepository();
const notificationService = new NotificationService();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();
const adminService = new AdminService(
  adminRepository,
  doctorRepository,
  walletRepository,
  notificationService,
  feedbackRepository,
  complaintRepository
);
const adminController = new AdminController(adminService, notificationService);

const adminRouter = express.Router();

adminRouter.post('/login', adminController.loginAdmin.bind(adminController));
adminRouter.post('/refresh-token', adminController.refreshAdminToken.bind(adminController));

adminRouter.post('/logout', adminController.logoutAdmin.bind(adminController));
adminRouter.get(
  '/users/paginated',
  authRole(['admin']),
  adminController.getUsersPaginated.bind(adminController)
);
adminRouter.patch(
  '/users/:userId/block',
  authRole(['admin']),
  adminController.toggleUserBlock.bind(adminController)
);

adminRouter.get(
  '/doctors/paginated',
  authRole(['admin']),
  adminController.getDoctorsPaginated.bind(adminController)
);

adminRouter.get(
  '/doctors/:id',
  authRole(['admin']),
  adminController.getDoctorById.bind(adminController)
);

adminRouter.patch(
  '/doctors/:id/approve',
  authRole(['admin']),
  adminController.approveDoctor.bind(adminController)
);
adminRouter.patch(
  '/doctors/:id/reject',
  authRole(['admin']),
  adminController.rejectDoctor.bind(adminController)
);

adminRouter.get(
  '/appointments/paginated',
  authRole(['admin']),
  adminController.appointmentsListPaginated.bind(adminController)
);

adminRouter.patch(
  '/appointments/:appointmentId/cancel',
  authRole(['admin']),
  adminController.adminCancelAppointment.bind(adminController)
);

adminRouter.get(
  '/wallet',
  authRole(['admin']),
  adminController.getAdminWalletPaginated.bind(adminController)
);

adminRouter.get(
  '/dashboard',
  authRole(['admin']),
  adminController.adminDashboard.bind(adminController)
);

adminRouter.get(
  '/dashboard/latest-doctor-requests',
  authRole(['admin']),
  adminController.getLatestDoctorRequests.bind(adminController)
);

adminRouter.get(
  '/dashboard/stats/appointments',
  authRole(['admin']),
  adminController.getAppointmentsStats.bind(adminController)
);

adminRouter.get(
  '/dashboard/stats/top-doctors',
  authRole(['admin']),
  adminController.getTopDoctors.bind(adminController)
);

adminRouter.get(
  '/dashboard/stats/revenue',
  authRole(['admin']),
  adminController.getRevenueStats.bind(adminController)
);

adminRouter.get(
  '/notifications',
  authRole(['admin']),
  adminController.getNotificationHistory.bind(adminController)
);

adminRouter.get(
  '/notifications/unread-count',
  authRole(['admin']),
  adminController.getUnreadCount.bind(adminController)
);

adminRouter.patch(
  '/notifications/read-all',
  authRole(['admin']),
  adminController.markAllAsRead.bind(adminController)
);

adminRouter.patch(
  '/notifications/:id/read',
  authRole(['admin']),
  adminController.markSingleAsRead.bind(adminController)
);

adminRouter.post(
  '/notifications/clear-all',
  authRole(['admin']),
  adminController.clearAll.bind(adminController)
);

adminRouter.get(
  '/complaints',
  authRole(['admin']),
  adminController.getAllComplaints.bind(adminController)
);

adminRouter.patch(
  '/complaints/update/:id',
  authRole(['admin']),
  adminController.updateComplaintStatus.bind(adminController)
);

export default adminRouter;
