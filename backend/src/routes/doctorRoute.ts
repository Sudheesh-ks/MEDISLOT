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
doctorRouter.post("/login", doctorController.loginDoctor.bind(doctorController));
doctorRouter.get("/appointments", authDoctor, doctorController.appointmentsDoctor.bind(doctorController));
doctorRouter.patch(
  "/appointments/:appointmentId/complete",  // ⬅️ CHANGED
  authDoctor,
  doctorController.appointmentComplete.bind(doctorController)
);

// ⬅️ CHANGED: POST /cancel-appointment → PATCH /appointments/:appointmentId/cancel
doctorRouter.patch(
  "/appointments/:appointmentId/cancel",    // ⬅️ CHANGED
  authDoctor,
  doctorController.appointmentCancel.bind(doctorController)
);




export default doctorRouter;
