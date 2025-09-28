import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { DoctorSlotService } from '../services/implementation/SlotService';
import { SlotController } from '../controllers/implementation/SlotController';

// Repository
const slotRepository = new SlotRepository();

// Service
const slotService = new DoctorSlotService(slotRepository);

// Controller
export const slotController = new SlotController(slotService);
