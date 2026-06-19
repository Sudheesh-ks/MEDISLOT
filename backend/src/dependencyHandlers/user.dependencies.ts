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
import { SlotService } from '../services/implementation/SlotService';
import { TempAppointmentRepository } from '../repositories/implementation/TempAppointmentRepository';
import { OtpRedisService } from '../services/implementation/OtpRedisService';
import { AppointmentService } from '../services/implementation/AppointmentService';
import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { AppointmentRepository } from '../repositories/implementation/AppointmentRepository';

// Repositories
const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const blogRepository = new BlogRepository();
const chatBotRepository = new ChatBotRepository();
const notificationRepository = new NotificationRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();
const patientHistoryRepository = new PatientHistoryRepository();
const tempAppointmentRepository = new TempAppointmentRepository();
const appointmentRepository = new AppointmentRepository();

// Services
const paymentService = new PaymentService();
const otpRedisService = new OtpRedisService();
const notificationService = new NotificationService(notificationRepository);
const blogService = new BlogService(blogRepository, doctorRepository);
const chatBotService = new ChatBotService(chatBotRepository);
const slotService = new SlotService(slotRepository);
const appointmentService = new AppointmentService(
  appointmentRepository,
  userRepository,
  doctorRepository,
  tempAppointmentRepository,
  slotRepository,
  walletRepository,
  notificationService,
  paymentService,
  slotService
);

const userService = new UserService(
  userRepository,
  otpRedisService,
  paymentService,
  slotService,
  slotRepository,
  walletRepository,
  notificationService,
  feedbackRepository,
  complaintRepository,
  patientHistoryRepository,
  tempAppointmentRepository,
  doctorRepository,
  appointmentRepository
);

// Controller
export const userController = new UserController(
  userService,
  paymentService,
  notificationService,
  blogService,
  chatBotService,
  appointmentService
);

export { userService };
