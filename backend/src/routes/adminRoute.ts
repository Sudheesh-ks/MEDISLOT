import express from "express";
import upload from "../middlewares/multer";
import authRole from "../middlewares/authRole";

// Dependency layers
import { AdminRepository } from "../repositories/implementation/AdminRepository";
import { AdminService } from "../services/implementation/AdminService";
import { AdminController } from "../controllers/implementation/AdminController";

import { DoctorRepository } from "../repositories/implementation/DoctorRepository";

// Admin Layer
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const adminService = new AdminService(adminRepository, doctorRepository);
const adminController = new AdminController(adminService);

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
  "/dashboard",
  authRole(["admin"]),
  adminController.adminDashboard.bind(adminController)
);

export default adminRouter;
