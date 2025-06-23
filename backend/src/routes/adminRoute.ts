import express from "express";
import upload from "../middlewares/multer";
import authRole from "../middlewares/authRole";

// Dependency layers
import { AdminRepository } from "../repositories/implementation/AdminRepository";
import { AdminService } from "../services/implementation/AdminService";
import { AdminController } from "../controllers/implementation/AdminController";

import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorSlotService } from "../services/implementation/SlotService";
import { SlotRepository } from "../repositories/implementation/SlotRepository";

// Admin Layer
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const slotRepository = new SlotRepository();
const adminService = new AdminService(adminRepository, doctorRepository);
const adminController = new AdminController(adminService);

// Doctor Layer
const doctorService = new DoctorService(doctorRepository);
const SlotService = new DoctorSlotService(slotRepository);
const doctorController = new DoctorController(doctorService, SlotService);

const adminRouter = express.Router();

adminRouter.post("/login", adminController.loginAdmin.bind(adminController));
adminRouter.post(
  "/refresh-token",
  adminController.refreshAdminToken.bind(adminController)
);

adminRouter.post(
  "/logout",
  adminController.logoutAdmin.bind(adminController)
);
adminRouter.get(
  "/users",
  authRole(["admin"]),
  adminController.getAllUsers.bind(adminController)
);
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
adminRouter.post(
  "/doctors",
  authRole(["admin"]),
  upload.single("image"),
  adminController.addDoctor.bind(adminController)
);
adminRouter.get(
  "/doctors",
  authRole(["admin"]),
  adminController.getDoctors.bind(adminController)
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

adminRouter.patch(
  "/doctors/:doctorId/availability",
  authRole(["admin"]),
  doctorController.changeAvailability.bind(doctorController)
);

adminRouter.get(
  "/appointments",
  authRole(["admin"]),
  adminController.appointmentsList.bind(adminController)
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
