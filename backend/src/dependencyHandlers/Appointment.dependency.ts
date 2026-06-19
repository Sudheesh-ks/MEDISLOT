import { AppointmentRepository } from '../repositories/implementation/AppointmentRepository';
import { DoctorRepository } from '../repositories/implementation/DoctorRepository';
import { NotificationRepository } from '../repositories/implementation/NotificationRepository';
import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { TempAppointmentRepository } from '../repositories/implementation/TempAppointmentRepository';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { WalletRepository } from '../repositories/implementation/WalletRepository';
import { AppointmentService } from '../services/implementation/AppointmentService';
import { NotificationService } from '../services/implementation/NotificationService';
import { PaymentService } from '../services/implementation/PaymentService';
import { SlotService } from '../services/implementation/SlotService';

const appointmentRepository = new AppointmentRepository();
const userRepository = new UserRepository();
const doctorRepository = new DoctorRepository();
const tempAppointmentRepository = new TempAppointmentRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();

const notificationService = new NotificationService(notificationRepository);
const paymentService = new PaymentService();
const slotService = new SlotService(slotRepository);
export const appointmentService = new AppointmentService(
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
