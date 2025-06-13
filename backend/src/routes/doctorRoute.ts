import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import authDoctor from "../middlewares/authDoctor";

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

const doctorRouter = express.Router();

doctorRouter.get("/", doctorController.doctorList.bind(doctorController));
doctorRouter.patch(
  "/availability",
  authDoctor,
  doctorController.changeAvailability.bind(doctorController)
);
doctorRouter.post(
  "/login",
  doctorController.loginDoctor.bind(doctorController)
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

export default doctorRouter;
