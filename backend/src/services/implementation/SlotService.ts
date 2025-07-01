import { SlotRepository } from "../../repositories/implementation/SlotRepository";
 import dayjs from "dayjs";
import customParse from "dayjs/plugin/customParseFormat";
dayjs.extend(customParse);

export class DoctorSlotService {
  constructor(private readonly _slotRepo: SlotRepository) {}

  async getMonthlySlots(doctorId: string, year: number, month: number) {
    return this._slotRepo.getSlotsByMonth(doctorId, year, month);
  }

  /** Ensure no overlaps and start < end */
  private validateRanges(
    ranges: { start: string; end: string; isAvailable?: boolean }[] // 🔧 added isAvailable, optional
  ) {
    const fmt = (t: string) => dayjs(t, "HH:mm");
    const sorted = [...ranges].sort(
      (a, b) => fmt(a.start).valueOf() - fmt(b.start).valueOf()
    );
    for (let i = 0; i < sorted.length; i++) { 
      const r = sorted[i];
      if (!fmt(r.end).isAfter(fmt(r.start)))
        throw new Error("End time must be after start time");
      if (i > 0 && fmt(r.start).isBefore(fmt(sorted[i - 1].end)))
        throw new Error("Time ranges cannot overlap");
    }
  }

  async updateDaySlot(doctorId: string, date: string, slots: { start: string; end: string }[], isCancelled: boolean) {
     this.validateRanges(slots);
    return this._slotRepo.upsertSlot(doctorId, date, slots, isCancelled);
  }

  async deleteDaySlot(doctorId: string, date: string) {
    return this._slotRepo.deleteSlot(doctorId, date);
  }

    /** Public endpoint for user side */
  async getDayAvailability(doctorId: string, date: string) {
    const doc = await this._slotRepo.getSlotByDate(doctorId, date);
    return doc?.slots ?? [];
  }
}
