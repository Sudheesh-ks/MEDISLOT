import express from "express";
import { UserController } from "../controllers/implementation/UserController";
import { UserService } from "../services/implementation/UserService";
import { UserRepository } from "../repositories/implementation/UserRepository";
import authUser from "../middlewares/authUser";
import upload from "../middlewares/multer";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = express.Router();

userRouter.post("/register", userController.registerUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
userRouter.post("/otp/resend",  userController.resendOtp.bind(userController));       // ⬅️ CHANGED
userRouter.post("/otp/verify",  userController.verifyOtp.bind(userController));   
userRouter.post("/password/forgot", userController.forgotPasswordRequest.bind(userController)); // ⬅️ CHANGED
userRouter.post("/password/reset",  userController.resetPassword.bind(userController));  
userRouter.get(
  "/profile",                                // ⬅️ CHANGED  (was /get-profile)
  authUser,
  userController.getProfile.bind(userController)
);
userRouter.put(
  "/profile",                                // ⬅️ CHANGED  (was /update-profile)
  upload.single("image"),
  authUser,
  userController.updateProfile.bind(userController)
);
userRouter.post(
  "/appointments",                           // ⬅️ CHANGED  (was /book-appointment)
  authUser,
  userController.bookAppointment.bind(userController)
);
userRouter.get(
  "/appointments",
  authUser,
  userController.listAppointment.bind(userController)
);

userRouter.patch(
  "/appointments/:appointmentId/cancel",     // ⬅️ CHANGED
  authUser,
  userController.cancelAppointment.bind(userController)
);

// ────────────────────────────────────────────────────────────────────────────────
// Payments (authenticated user)
// ────────────────────────────────────────────────────────────────────────────────
userRouter.post(
  "/payments/razorpay",                      // ⬅️ CHANGED  (was /payment-razorpay)
  authUser,
  userController.paymentRazorpay.bind(userController)
);
userRouter.post(
  "/payments/razorpay/verify",               // ⬅️ CHANGED  (was /verifyRazorpay)
  authUser,
  userController.verifyRazorpay.bind(userController)
);

export default userRouter;
