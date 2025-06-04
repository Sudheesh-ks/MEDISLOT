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
adminRouter.get("/users", adminController.getAllUsers.bind(adminController));
adminRouter.post(
  "/toggle-user-block",
  adminController.toggleUserBlock.bind(adminController)
);
adminRouter.post(
  "/add-doctor",
  authAdmin,
  upload.single("image"),
  adminController.addDoctor.bind(adminController)
);
adminRouter.post(
  "/all-doctors",
  authAdmin,
  adminController.allDoctors.bind(adminController)
);

adminRouter.post(
  "/change-availability",
  authAdmin,
  doctorController.changeAvailability.bind(doctorController)
);

export default adminRouter;
