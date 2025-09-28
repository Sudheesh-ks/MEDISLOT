import { AdminRepository } from '../repositories/implementation/AdminRepository';
import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { NotificationRepository } from '../repositories/implementation/NotificationRepository';
import { FeedbackRepository } from '../repositories/implementation/FeedbackRepository';
import { ComplaintRepository } from '../repositories/implementation/ComplaintRepository';

import { NotificationService } from '../services/implementation/NotificationService';
import { AdminService } from '../services/implementation/AdminService';
import { AdminController } from '../controllers/implementation/AdminController';

// Repositories
const adminRepository = new AdminRepository();
const doctorRepository = new DoctorRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();
const feedbackRepository = new FeedbackRepository();
const complaintRepository = new ComplaintRepository();

// Services
const notificationService = new NotificationService(notificationRepository);
const adminService = new AdminService(
  adminRepository,
  doctorRepository,
  walletRepository,
  notificationService,
  feedbackRepository,
  complaintRepository
);

// Controller
export const adminController = new AdminController(adminService, notificationService);
