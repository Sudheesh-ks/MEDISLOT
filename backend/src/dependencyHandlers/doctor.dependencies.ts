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
import { AppointmentRepository } from '../repositories/implementation/AppointmentRepository';
import { TempAppointmentRepository } from '../repositories/implementation/TempAppointmentRepository';
import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { PaymentService } from '../services/implementation/PaymentService';
import { SlotService } from '../services/implementation/SlotService';
import { AppointmentService } from '../services/implementation/AppointmentService';

// Repositories
const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();
const blogRepository = new BlogRepository();
const patientHistoryRepository = new PatientHistoryRepository();
const complaintRepository = new ComplaintRepository();
const appointmentRepository = new AppointmentRepository();
const tempAppointmentRepository = new TempAppointmentRepository();
const slotRepository = new SlotRepository();

// Services
const notificationService = new NotificationService(notificationRepository);
const blogService = new BlogService(blogRepository, doctorRepository);
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

const doctorService = new DoctorService(
  doctorRepository,
  userRepository,
  walletRepository,
  notificationService,
  patientHistoryRepository,
  complaintRepository,
  appointmentRepository
);

// Controller
export const doctorController = new DoctorController(
  doctorService,
  notificationService,
  blogService,
  appointmentService
);
