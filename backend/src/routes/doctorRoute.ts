// import express from "express";
// import { doctorList } from "../controllers/doctorController";

// const doctorRouter = express.Router()


// doctorRouter.get('/list',doctorList);


// export default doctorRouter


import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";

const doctorRouter = express.Router();

const doctorController = new DoctorController(new DoctorService(new DoctorRepository()));

doctorRouter.get("/list", doctorController.doctorList.bind(doctorController));
doctorRouter.patch("/availability", doctorController.changeAvailability.bind(doctorController));

export default doctorRouter;