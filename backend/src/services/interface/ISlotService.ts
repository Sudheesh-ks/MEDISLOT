import { SlotDocument } from "../../models/slotModel";

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
}
