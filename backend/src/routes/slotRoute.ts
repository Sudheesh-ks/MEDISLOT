import express from 'express';
import authRole from '../middlewares/authRole';
import { slotController } from '../dependencyHandlers/slots.dependencies';

const slotRouter = express.Router();

slotRouter.post('/', authRole(['doctor']), slotController.updateDaySlot.bind(slotController));

slotRouter.get('/day', authRole(['doctor']), slotController.getDaySlot.bind(slotController));

slotRouter.post(
  '/default',
  authRole(['doctor']),
  slotController.updateDefaultSlot.bind(slotController)
);

slotRouter.get(
  '/default',
  authRole(['doctor']),
  slotController.getDefaultSlot.bind(slotController)
);

export default slotRouter;
