import { Request, Response } from 'express';
import logger from '../../utils/logger';
import { HttpStatus } from '../../constants/status.constants';
import { ISlotController } from '../interface/IslotController';
import { ISlotService } from '../../services/interface/ISlotService';

export class SlotController implements ISlotController {
  constructor(private readonly _slotService: ISlotService) {}

  async updateDaySlot(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { date, slots, isCancelled } = req.body;

      const data = await this._slotService.updateDaySlot(doctorId, date, slots, isCancelled);
      logger.info(`Updated slots for ${doctorId} on ${date}`);

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      logger.error(`Update day slot error: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDaySlot(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { date } = req.query;

      const data = await this._slotService.getDayAvailability(doctorId, date as string);
      logger.info(`Fetched day slot for ${doctorId} on ${date}`);

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      logger.error(`Get day slot error: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async updateDefaultSlot(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const { weekday, slots, isCancelled } = req.body;

      const data = await this._slotService.updateDefaultSlot(doctorId, weekday, slots, isCancelled);
      logger.info(`Updated default slots for ${doctorId} on weekday ${weekday}`);

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      logger.error(`Update default slot error: ${(error as Error).message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getDefaultSlot(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req as any).docId;
      const weekday = Number(req.query.weekday);

      const data = await this._slotService.getDefaultSlot(doctorId, weekday);

      res.status(HttpStatus.OK).json({ success: true, data });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}
