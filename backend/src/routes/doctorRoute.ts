import express from "express";
import { DoctorController } from "../controllers/implementation/DoctorController";
import { DoctorService } from "../services/implementation/DoctorService";
import { DoctorRepository } from "../repositories/implementation/DoctorRepository";
import upload from "../middlewares/multer";
import authRole from "../middlewares/authRole";
import { WalletRepository } from "../repositories/implementation/WalletRepository";
import { NotificationService } from "../services/implementation/NotificationService";

const doctorRepository = new DoctorRepository();
const walletRepository = new WalletRepository();
const notificationService = new NotificationService();
const doctorService = new DoctorService(doctorRepository, walletRepository, notificationService);
const doctorController = new DoctorController(doctorService, notificationService);

const doctorRouter = express.Router();

doctorRouter.get("/", doctorController.doctorList.bind(doctorController));
doctorRouter.get(
  "/paginated",
  doctorController.getDoctorsPaginated.bind(doctorController)
);
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
  "/appointments/active",
  authRole(["doctor"]),
  doctorController.getActiveAppointment.bind(doctorController)
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
  "/wallet",
  authRole(["doctor"]),
  doctorController.getDoctorWallet.bind(doctorController)
);



doctorRouter.get(
  "/notifications",
  authRole(["doctor"]),
  doctorController.getNotificationHistory.bind(doctorController)
);

// Get unread count
doctorRouter.get(
  "/notifications/unread-count",
  authRole(["doctor"]),
  doctorController.getUnreadCount.bind(doctorController)
);

// Mark all as read
doctorRouter.patch(
  "/notifications/read-all",
  authRole(["doctor"]),
  doctorController.markAllAsRead.bind(doctorController)
);

// Mark single notification as read
doctorRouter.patch(
  "/notifications/:id/read",
  authRole(["doctor"]),
  doctorController.markSingleAsRead.bind(doctorController)
);



doctorRouter.get("/:id", doctorController.getDoctorById.bind(doctorController));



export default doctorRouter;
