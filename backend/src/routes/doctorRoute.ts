import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import authDoctor from "../middlewares/authDoctor";

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorController.doctorList.bind(doctorController));
doctorRouter.patch(
  "/availability",
  authDoctor,
  doctorController.changeAvailability.bind(doctorController)
);
doctorRouter.post("/login", doctorController.loginDoctor.bind(doctorController));
doctorRouter.get("/appointments", authDoctor, doctorController.appointmentsDoctor.bind(doctorController));
doctorRouter.post("/complete-appointment", authDoctor, doctorController.appointmentComplete.bind(doctorController));
doctorRouter.post("/cancel-appointment", authDoctor, doctorController.appointmentCancel.bind(doctorController));




export default doctorRouter;
