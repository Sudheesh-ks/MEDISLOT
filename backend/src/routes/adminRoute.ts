import express from "express";
import upload from "../middlewares/multer";
import authRole from "../middlewares/authRole";

// Dependency layers
import { AdminRepository } from "../repositories/implementation/AdminRepository";
import { AdminService } from "../services/implementation/AdminService";
import { AdminController } from "../controllers/implementation/AdminController";

import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import { WalletRepository } from "../repositories/implementation/WalletRepository";
import { NotificationService } from "../services/implementation/NotificationService";

// Admin Layer
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const walletRepository = new WalletRepository();
const notificationService = new NotificationService();
const adminService = new AdminService(adminRepository, doctorRepository, walletRepository, notificationService);
const adminController = new AdminController(adminService, notificationService);

const adminRouter = express.Router();

adminRouter.post("/login", adminController.loginAdmin.bind(adminController));
adminRouter.post(
  "/refresh-token",
  adminController.refreshAdminToken.bind(adminController)
);

adminRouter.post("/logout", adminController.logoutAdmin.bind(adminController));
adminRouter.get(
  "/users/paginated",
  authRole(["admin"]),
  adminController.getUsersPaginated.bind(adminController)
);
adminRouter.patch(
  "/users/:userId/block",
  authRole(["admin"]),
  adminController.toggleUserBlock.bind(adminController)
);

adminRouter.get(
  "/doctors/paginated",
  authRole(["admin"]),
  adminController.getDoctorsPaginated.bind(adminController)
);

adminRouter.patch(
  "/doctors/:id/approve",
  authRole(["admin"]),
  adminController.approveDoctor.bind(adminController)
);
adminRouter.patch(
  "/doctors/:id/reject",
  authRole(["admin"]),
  adminController.rejectDoctor.bind(adminController)
);

adminRouter.get(
  "/appointments/paginated",
  authRole(["admin"]),
  adminController.appointmentsListPaginated.bind(adminController)
);

adminRouter.patch(
  "/appointments/:appointmentId/cancel",
  authRole(["admin"]),
  adminController.adminCancelAppointment.bind(adminController)
);

adminRouter.get(
  "/wallet",
  authRole(["admin"]),
  adminController.getAdminWallet.bind(adminController)
);


adminRouter.get(
  "/dashboard",
  authRole(["admin"]),
  adminController.adminDashboard.bind(adminController)
);


adminRouter.get(
  "/notifications",
  authRole(["admin"]),
  adminController.getNotificationHistory.bind(adminController)
);

// Get unread count
adminRouter.get(
  "/notifications/unread-count",
  authRole(["admin"]),
  adminController.getUnreadCount.bind(adminController)
);

// Mark all as read
adminRouter.patch(
  "/notifications/read-all",
  authRole(["admin"]),
  adminController.markAllAsRead.bind(adminController)
);

// Mark single notification as read
adminRouter.patch(
  "/notifications/:id/read",
  authRole(["admin"]),
  adminController.markSingleAsRead.bind(adminController)
);


export default adminRouter;
