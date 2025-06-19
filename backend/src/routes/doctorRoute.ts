import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import authDoctor from "../middlewares/authDoctor";
import upload from "../middlewares/multer";

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

const doctorRouter = express.Router();

doctorRouter.get("/", doctorController.doctorList.bind(doctorController));
doctorRouter.post(
  "/register",
  upload.single("image"),
  doctorController.registerDoctor.bind(doctorController)
);
doctorRouter.patch(
  "/availability",
  authDoctor,
  doctorController.changeAvailability.bind(doctorController)
);
doctorRouter.post(
  "/login",
  doctorController.loginDoctor.bind(doctorController)
);

doctorRouter.post(
  "/refresh-token",
  doctorController.refreshDoctorToken.bind(doctorController)
);

doctorRouter.post(
  "/logout",
  doctorController.logoutDoctor.bind(doctorController)
);

doctorRouter.get(
  "/appointments",
  authDoctor,
  doctorController.appointmentsDoctor.bind(doctorController)
);
doctorRouter.patch(
  "/appointments/:appointmentId/confirm",
  authDoctor,
  doctorController.appointmentConfirm.bind(doctorController)
);

doctorRouter.patch(
  "/appointments/:appointmentId/cancel",
  authDoctor,
  doctorController.appointmentCancel.bind(doctorController)
);

doctorRouter.get(
  "/profile",
  authDoctor,
  doctorController.doctorProfile.bind(doctorController)
);

doctorRouter.patch(
  "/profile/update",
  authDoctor,
  upload.single("image"),
  doctorController.updateDoctorProfile.bind(doctorController)
);

export default doctorRouter;
