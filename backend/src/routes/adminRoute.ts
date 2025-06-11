import express from "express";
import upload from "../middlewares/multer";
import authAdmin from "../middlewares/authAdmin";

// Dependency layers
import { AdminRepository } from "../repositories/implementation/AdminRepository";
import { AdminService } from "../services/implementation/AdminService";
import { AdminController } from "../controllers/implementation/AdminController";

import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorController } from "../controllers/implementation/DoctorController";

// Admin Layer
const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

// Doctor Layer
const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

const adminRouter = express.Router();

adminRouter.post("/login", adminController.loginAdmin.bind(adminController));
adminRouter.get(
  "/users",
  authAdmin,
  adminController.getAllUsers.bind(adminController)
);
adminRouter.patch(
  "/users/:userId/block",
  authAdmin,
  adminController.toggleUserBlock.bind(adminController)
);
adminRouter.post(
  "/doctors",
  authAdmin,
  upload.single("image"),
  adminController.addDoctor.bind(adminController)
);
adminRouter.get(
  "/doctors",
  authAdmin,
  adminController.getDoctors.bind(adminController)
);

adminRouter.patch(
  "/doctors/:doctorId/availability",
  authAdmin,
  doctorController.changeAvailability.bind(doctorController)
);

adminRouter.get(
  "/appointments",
  authAdmin,
  adminController.appointmentsList.bind(adminController)
);


adminRouter.patch(
  "/appointments/:appointmentId/cancel",
  authAdmin,
  adminController.adminCancelAppointment.bind(adminController)
);


adminRouter.get(
  "/dashboard",
  authAdmin,
  adminController.adminDashboard.bind(adminController)
);

export default adminRouter;
