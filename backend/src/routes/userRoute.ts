import express from 'express';
import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import upload from '../middlewares/multer';
import { PaymentService } from '../services/implementation/PaymentService';
import authRole from '../middlewares/authRole';
import { NotificationService } from '../services/implementation/NotificationService';
import { BlogService } from '../services/implementation/BlogService';
import { ChatBotService } from '../services/implementation/chatBotService';
import { ChatBotRepository } from '../repositories/implementation/chatBotRepository';
import { NotificationRepository } from '../repositories/implementation/NotificationRepository';
import { BlogRepository } from '../repositories/implementation/BlogRepository';
import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { FeedbackRepository } from '../repositories/implementation/FeedbackRepository';
import { ComplaintRepository } from '../repositories/implementation/ComplaintRepository';
import { PatientHistoryRepository } from '../repositories/implementation/PatientHistoryRepository';

const userRepository = new UserRepository();
const blogRepository = new BlogRepository();
const chatBotRepository = new ChatBotRepository();
const notificationRepository = new NotificationRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();
const patientHistoryRepository = new PatientHistoryRepository();
const paymentService = new PaymentService();
const notificationService = new NotificationService(notificationRepository);
const blogService = new BlogService(blogRepository, userRepository);
const chatBotService = new ChatBotService(chatBotRepository);
const userService = new UserService(
  userRepository,
  paymentService,
  slotRepository,
  walletRepository,
  notificationService,
  feedbackRepository,
  complaintRepository,
  patientHistoryRepository
);
const userController = new UserController(
  userService,
  paymentService,
  notificationService,
  blogService,
  chatBotService
);

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

userRouter.get(
  '/notifications/unread-count',
  authRole(['user']),
  userController.getUnreadCount.bind(userController)
);

userRouter.patch(
  '/notifications/read-all',
  authRole(['user']),
  userController.markAllAsRead.bind(userController)
);

userRouter.patch(
  '/notifications/:id/read',
  authRole(['user']),
  userController.markSingleAsRead.bind(userController)
);

userRouter.post(
  '/notifications/clear-all',
  authRole(['user']),
  userController.clearAll.bind(userController)
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

userRouter.get('/blogs', authRole(['user']), userController.getAllBlogs.bind(userController));

userRouter.get('/blogs/:id', authRole(['user']), userController.getBlogById.bind(userController));

userRouter.get(
  '/blogs/:id/comments',
  authRole(['user']),
  userController.getBlogComments.bind(userController)
);

userRouter.post(
  '/blogs/:id/comments',
  authRole(['user']),
  userController.addBlogComment.bind(userController)
);

userRouter.get(
  '/feedbacks/:doctorId',
  authRole(['user']),
  userController.getDoctorReviews.bind(userController)
);

userRouter.post(
  '/complaints/report',
  authRole(['user']),
  userController.reportIssues.bind(userController)
);

userRouter.post(
  '/chatbot/chat',
  authRole(['user']),
  userController.sendChatMessage.bind(userController)
);

userRouter.get(
  '/chatbot/history/:sessionId',
  authRole(['user']),
  userController.getChatHistory.bind(userController)
);

userRouter.get('/:id', userController.getUserById.bind(userController));

export default userRouter;
