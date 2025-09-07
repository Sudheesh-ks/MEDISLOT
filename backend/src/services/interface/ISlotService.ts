import { SlotDocument } from '../../models/slotModel';
import { SlotRange } from '../../types/slots';

export interface ISlotService {
  getMonthlySlots(doctorId: string, year: number, month: number): Promise<any>;
  updateDaySlot(
    doctorId: string,
    date: string,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean
  ): Promise<any>;
  deleteDaySlot(doctorId: string, date: string): Promise<SlotDocument | null>;
  getDayAvailability(doctorId: string, date: string): Promise<any>;
  updateDefaultSlot(
    doctorId: string,
    weekday: number,
    slots: SlotRange[],
    isCancelled: boolean
  ): Promise<any>;
  getDefaultSlot(doctorId: string, weekday: number): Promise<any>;
}
