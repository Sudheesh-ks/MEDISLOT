import { AdminRepository } from '../repositories/implementation/AdminRepository';
import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { NotificationRepository } from '../repositories/implementation/NotificationRepository';
import { FeedbackRepository } from '../repositories/implementation/FeedbackRepository';
import { ComplaintRepository } from '../repositories/implementation/ComplaintRepository';

import { NotificationService } from '../services/implementation/NotificationService';
import { AdminService } from '../services/implementation/AdminService';
import { AdminController } from '../controllers/implementation/AdminController';
import { AppointmentService } from '../services/implementation/AppointmentService';
import { AppointmentRepository } from '../repositories/implementation/AppointmentRepository';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { TempAppointmentRepository } from '../repositories/implementation/TempAppointmentRepository';
import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { PaymentService } from '../services/implementation/PaymentService';
import { SlotService } from '../services/implementation/SlotService';

// Repositories
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();
const appointmentRepository = new AppointmentRepository();
const tempAppointmentRepository = new TempAppointmentRepository();
const slotRepository = new SlotRepository();

// Services
const notificationService = new NotificationService(notificationRepository);
const paymentService = new PaymentService();
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
export const adminService = new AdminService(
  adminRepository,
  doctorRepository,
  userRepository,
  walletRepository,
  notificationService,
  feedbackRepository,
  complaintRepository,
  appointmentRepository
);

// Controller
export const adminController = new AdminController(
  adminService,
  notificationService,
  appointmentService
);
