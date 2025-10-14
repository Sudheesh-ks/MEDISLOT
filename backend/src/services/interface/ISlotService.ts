import { slotDTO } from '../../dtos/slot.dto';
import { SlotRange } from '../../types/slots';

export interface ISlotService {
  getMonthlySlots(doctorId: string, year: number, month: number): Promise<slotDTO[]>;
  updateDaySlot(
    doctorId: string,
    date: string,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean
  ): Promise<any>;
  deleteDaySlot(doctorId: string, date: string): Promise<slotDTO>;
  getDayAvailability(doctorId: string, date: string, userId: string): Promise<SlotRange[]>;
  updateDefaultSlot(
    doctorId: string,
    weekday: number,
    slots: SlotRange[],
    isCancelled: boolean
  ): Promise<slotDTO>;
  getDefaultSlot(doctorId: string, weekday: number): Promise<slotDTO>;
  lockSlot(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string
  ): Promise<{ success: boolean; expiresAt: Date }>;

  releaseSlotLock(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string
  ): Promise<void>;
}
