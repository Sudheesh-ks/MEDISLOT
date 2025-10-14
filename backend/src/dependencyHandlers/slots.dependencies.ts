import { SlotRepository } from '../repositories/implementation/SlotRepository';
import { SlotController } from '../controllers/implementation/SlotController';
import { SlotService } from '../services/implementation/SlotService';

// Repository
const slotRepository = new SlotRepository();

// Service
const slotService = new SlotService(slotRepository);

// Controller
export const slotController = new SlotController(slotService);
