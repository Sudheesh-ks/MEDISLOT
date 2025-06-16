import express from "express";
import { UserController } from "../controllers/implementation/UserController";
import { UserService } from "../services/implementation/UserService";
import { UserRepository } from "../repositories/implementation/UserRepository";
import authUser from "../middlewares/authUser";
import upload from "../middlewares/multer";
import { PaymentService } from "../services/implementation/PaymentService";

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
userRouter.get("/refresh-token", userController.refreshToken.bind(userController));
userRouter.post("/logout", userController.logout.bind(userController));
userRouter.get(
  "/profile",
  authUser,
  userController.getProfile.bind(userController)
);
userRouter.put(
  "/profile",
  upload.single("image"),
  authUser,
  userController.updateProfile.bind(userController)
);
userRouter.post(
  "/appointments",
  authUser,
  userController.bookAppointment.bind(userController)
);
userRouter.get(
  "/appointments",
  authUser,
  userController.listAppointment.bind(userController)
);

userRouter.patch(
  "/appointments/:appointmentId/cancel",
  authUser,
  userController.cancelAppointment.bind(userController)
);

userRouter.post(
  "/payments/razorpay",
  authUser,
  userController.paymentRazorpay.bind(userController)
);
userRouter.post(
  "/payments/razorpay/verify",
  authUser,
  userController.verifyRazorpay.bind(userController)
);

export default userRouter;
