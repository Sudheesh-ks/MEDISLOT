import express from 'express';
import { SlotController } from '../controllers/implementation/SlotController';
import { DoctorSlotService } from '../services/implementation/SlotService';
import { SlotRepository } from '../repositories/implementation/SlotRepository';
import authRole from '../middlewares/authRole';

const slotRepository = new SlotRepository();
const slotService = new DoctorSlotService(slotRepository);
const slotController = new SlotController(slotService);

const slotRouter = express.Router();

slotRouter.post('/', authRole(['doctor']), slotController.updateDaySlot.bind(slotController));

slotRouter.get('/day', authRole(['doctor']), slotController.getDaySlot.bind(slotController));

export default slotRouter;
