import { SlotDocument } from '../../models/SlotModel';

export interface ISlotRepository {
  getSlotsByDoctor(doctorId: string): Promise<SlotDocument[]>;
  getSlotsByMonth(doctorId: string, year: number, month: number): Promise<SlotDocument[]>;
  upsertSlot(
    doctorId: string,
    date: string | null,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean,
    weekday?: number,
    isDefault?: boolean,
    session?: any
  ): Promise<SlotDocument | null>;
  deleteSlot(doctorId: string, date: string): Promise<SlotDocument | null>;
  getSlotByDate(doctorId: string, date: string, session?: any): Promise<SlotDocument | null>;
  getDefaultSlotByWeekday(
    doctorId: string,
    weekday: number,
    session?: any
  ): Promise<SlotDocument | null>;
  getDefaultSlot(doctorId: string, weekday: number): Promise<SlotDocument | null>;
  lockSlotRecord(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    lockExpiresAt: Date
  ): Promise<void>;

  markSlotBooked(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    session?: any
  ): Promise<void>;
  getAvailableSlotsByDoctorAndMonth(doctorId: string, year: number, month: number): Promise<any[]>;
  unbookSlot(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    session?: any
  ): Promise<void>;

  releaseSlotLock(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    session?: any
  ): Promise<void>;
}
