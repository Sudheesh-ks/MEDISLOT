import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import upload from "../middlewares/multer";
import authRole from "../middlewares/authRole";
import { SlotRepository } from "../repositories/implementation/SlotRepository";
import { DoctorSlotService } from "../services/implementation/SlotService";

const doctorRepository = new DoctorRepository();
const slotRepository = new SlotRepository();
const doctorService = new DoctorService(doctorRepository);
const slotService = new DoctorSlotService(slotRepository);
const doctorController = new DoctorController(doctorService, slotService);

const doctorRouter = express.Router();

doctorRouter.get("/", doctorController.doctorList.bind(doctorController));
doctorRouter.get("/paginated", doctorController.getDoctorsPaginated.bind(doctorController));
doctorRouter.post(
  "/register",
  upload.single("image"),
  doctorController.registerDoctor.bind(doctorController)
);
doctorRouter.patch(
  "/availability",
  authRole(["doctor"]),
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
  authRole(["doctor"]),
  doctorController.appointmentsDoctor.bind(doctorController)
);
doctorRouter.get(
  "/appointments/paginated",
  authRole(["doctor"]),
  doctorController.appointmentsDoctorPaginated.bind(doctorController)
);
doctorRouter.patch(
  "/appointments/:appointmentId/confirm",
  authRole(["doctor"]),
  doctorController.appointmentConfirm.bind(doctorController)
);

doctorRouter.patch(
  "/appointments/:appointmentId/cancel",
  authRole(["doctor"]),
  doctorController.appointmentCancel.bind(doctorController)
);

doctorRouter.get(
  "/profile",
  authRole(["doctor"]),
  doctorController.doctorProfile.bind(doctorController)
);

doctorRouter.patch(
  "/profile/update",
  authRole(["doctor"]),
  upload.single("image"),
  doctorController.updateDoctorProfile.bind(doctorController)
);

doctorRouter.get(
  "/slots",
  authRole(["doctor"]),
  doctorController.getMonthlySlots.bind(doctorController)
);

doctorRouter.post(
  "/slots",
  authRole(["doctor"]),
  doctorController.updateDaySlot.bind(doctorController)
);

export default doctorRouter;
