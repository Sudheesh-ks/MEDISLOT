import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";


const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

const doctorRouter = express.Router();


doctorRouter.get("/list", doctorController.doctorList.bind(doctorController));
doctorRouter.patch("/availability", doctorController.changeAvailability.bind(doctorController));

export default doctorRouter;