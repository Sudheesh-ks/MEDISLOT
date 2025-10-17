import { SlotDocument } from '../../models/slotModel';

export interface ISlotRepository {
  getSlotsByDoctor(doctorId: string): Promise<SlotDocument[]>;
  getSlotsByMonth(doctorId: string, year: number, month: number): Promise<SlotDocument[]>;
  upsertSlot(
    doctorId: string,
    date: string | null,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean,
    weekday?: number,
    isDefault?: boolean
  ): Promise<SlotDocument | null>;
  deleteSlot(doctorId: string, date: string): Promise<SlotDocument | null>;
  getSlotByDate(doctorId: string, date: string): Promise<SlotDocument | null>;
  getDefaultSlotByWeekday(doctorId: string, weekday: number): Promise<SlotDocument | null>;
  getDefaultSlot(doctorId: string, weekday: number): Promise<SlotDocument | null>;
  lockSlotRecord(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    lockExpiresAt: Date
  ): Promise<void>;

  markSlotBooked(doctorId: string, date: string, start: string, end: string): Promise<void>;
}
