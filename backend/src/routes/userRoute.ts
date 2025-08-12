import express from 'express';
import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import upload from '../middlewares/multer';
import { PaymentService } from '../services/implementation/PaymentService';
import authRole from '../middlewares/authRole';
import { NotificationService } from '../services/implementation/NotificationService';

const userRepository = new UserRepository();
const paymentService = new PaymentService();
const notificationService = new NotificationService();
const userService = new UserService(userRepository, paymentService);
const userController = new UserController(userService, paymentService, notificationService);

const userRouter = express.Router();

userRouter.post('/register', userController.registerUser.bind(userController));
userRouter.post('/login', userController.loginUser.bind(userController));
userRouter.post('/otp/resend', userController.resendOtp.bind(userController));
userRouter.post('/otp/verify', userController.verifyOtp.bind(userController));
userRouter.post('/password/forgot', userController.forgotPasswordRequest.bind(userController));
userRouter.post('/password/reset', userController.resetPassword.bind(userController));
userRouter.post('/refresh-token', userController.refreshToken.bind(userController));
userRouter.post('/logout', userController.logout.bind(userController));
userRouter.get('/profile', authRole(['user']), userController.getProfile.bind(userController));
userRouter.put(
  '/profile',
  upload.single('image'),
  authRole(['user']),
  userController.updateProfile.bind(userController)
);

userRouter.get('/wallet', authRole(['user']), userController.getUserWallet.bind(userController));

userRouter.post(
  '/appointments',
  authRole(['user']),
  userController.bookAppointment.bind(userController)
);
userRouter.get(
  '/appointments',
  authRole(['user']),
  userController.listAppointment.bind(userController)
);

userRouter.patch(
  '/appointments/:appointmentId/cancel',
  authRole(['user']),
  userController.cancelAppointment.bind(userController)
);

userRouter.get(
  '/appointments/active',
  authRole(['user']),
  userController.getActiveAppointment.bind(userController)
);

userRouter.post(
  '/payments/razorpay',
  authRole(['user']),
  userController.paymentRazorpay.bind(userController)
);
userRouter.post(
  '/payments/razorpay/verify',
  authRole(['user']),
  userController.verifyRazorpay.bind(userController)
);

userRouter.get(
  '/available-slots',
  authRole(['user']),
  userController.getAvailableSlotsByDate.bind(userController)
);

userRouter.get(
  '/notifications',
  authRole(['user']),
  userController.getNotificationHistory.bind(userController)
);

// Get unread count
userRouter.get(
  '/notifications/unread-count',
  authRole(['user']),
  userController.getUnreadCount.bind(userController)
);

// Mark all as read
userRouter.patch(
  '/notifications/read-all',
  authRole(['user']),
  userController.markAllAsRead.bind(userController)
);

// Mark single notification as read
userRouter.patch(
  '/notifications/:id/read',
  authRole(['user']),
  userController.markSingleAsRead.bind(userController)
);

userRouter.post(
  '/appointments/:apptId/feedback',
  authRole(['user']),
  userController.submitFeedback.bind(userController)
);

userRouter.get(
  '/appointments/:appointmentId/prescription',
  authRole(['doctor', 'user']),
  userController.getPrescriptionByAppointmentId.bind(userController)
);

userRouter.get('/:id', userController.getUserById.bind(userController));

export default userRouter;
