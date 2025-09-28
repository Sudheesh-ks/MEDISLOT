import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { PaymentService } from '../services/implementation/PaymentService';
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

// Repositories
const userRepository = new UserRepository();
const blogRepository = new BlogRepository();
const chatBotRepository = new ChatBotRepository();
const notificationRepository = new NotificationRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();
const patientHistoryRepository = new PatientHistoryRepository();

// Services
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

// Controller
export const userController = new UserController(
  userService,
  paymentService,
  notificationService,
  blogService,
  chatBotService
);
