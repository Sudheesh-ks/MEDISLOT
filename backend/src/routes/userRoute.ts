import express from "express";
import { UserController } from "../controllers/implementation/UserController";
import { UserService } from "../services/implementation/UserService";
import { UserRepository } from "../repositories/implementation/UserRepository";
import upload from "../middlewares/multer";
import { PaymentService } from "../services/implementation/PaymentService";
import authRole from "../middlewares/authRole";
// import { ChatController } from '../controllers/implementation/ChatController';

const userRepository = new UserRepository();
const paymentService = new PaymentService();
const userService = new UserService(userRepository, paymentService);
const userController = new UserController(userService, paymentService);

const userRouter = express.Router();

userRouter.post("/register", userController.registerUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
userRouter.post("/otp/resend", userController.resendOtp.bind(userController));
userRouter.post("/otp/verify", userController.verifyOtp.bind(userController));
userRouter.post(
  "/password/forgot",
  userController.forgotPasswordRequest.bind(userController)
);
userRouter.post(
  "/password/reset",
  userController.resetPassword.bind(userController)
);
userRouter.post("/refresh-token", userController.refreshToken.bind(userController));
userRouter.post("/logout", userController.logout.bind(userController));
userRouter.get(
  "/profile",
  authRole(["user"]),
  userController.getProfile.bind(userController)
);
userRouter.put(
  "/profile",
  upload.single("image"),
  authRole(["user"]),
  userController.updateProfile.bind(userController)
);
userRouter.post(
  "/appointments",
  authRole(["user"]),
  userController.bookAppointment.bind(userController)
);
userRouter.get(
  "/appointments",
  authRole(["user"]),
  userController.listAppointment.bind(userController)
);

userRouter.patch(
  "/appointments/:appointmentId/cancel",
  authRole(["user"]),
  userController.cancelAppointment.bind(userController)
);

userRouter.post(
  "/payments/razorpay",
  authRole(["user"]),
  userController.paymentRazorpay.bind(userController)
);
userRouter.post(
  "/payments/razorpay/verify",
  authRole(["user"]),
  userController.verifyRazorpay.bind(userController)
);

userRouter.get(
  "/available-slots",
  authRole(["user"]),
  userController.getAvailableSlotsByDate.bind(userController)
);


userRouter.get("/:id", userController.getUserById.bind(userController));



export default userRouter;
