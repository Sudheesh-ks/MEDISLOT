import { DoctorController } from '../controllers/implementation/DoctorController';
import { DoctorService } from '../services/implementation/DoctorService';
import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { NotificationService } from '../services/implementation/NotificationService';
import { BlogService } from '../services/implementation/BlogService';
import { PatientHistoryRepository } from '../repositories/implementation/PatientHistoryRepository';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { ComplaintRepository } from '../repositories/implementation/ComplaintRepository';
import { NotificationRepository } from '../repositories/implementation/NotificationRepository';
import { BlogRepository } from '../repositories/implementation/BlogRepository';

// Repositories
const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();
const blogRepository = new BlogRepository();
const patientHistoryRepository = new PatientHistoryRepository();
const complaintRepository = new ComplaintRepository();

// Services
const notificationService = new NotificationService(notificationRepository);
const blogService = new BlogService(blogRepository, userRepository);

const doctorService = new DoctorService(
  doctorRepository,
  userRepository,
  walletRepository,
  notificationService,
  patientHistoryRepository,
  complaintRepository
);

// Controller
export const doctorController = new DoctorController(
  doctorService,
  notificationService,
  blogService
);
