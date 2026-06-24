import { slotDTO } from '../../dtos/Slot.dto';
import { SlotRange } from '../../types/Slots';

export interface ISlotService {
  getMonthlySlots(doctorId: string, year: number, month: number): Promise<slotDTO[]>;
  reserveSlotForAppointment(
    doctorId: string,
    slotDate: string,
    slotStartTime: string,
    slotEndTime: string,
    session?: any
  ): Promise<void>;
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
  unbookSlot(doctorId: string, date: string, start: string, end: string): Promise<void>;
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
    userId: string,
    session?: any
  ): Promise<void>;
}
