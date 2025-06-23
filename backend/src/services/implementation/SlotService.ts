import { SlotRepository } from "../../repositories/implementation/SlotRepository";

export class DoctorSlotService {
  constructor(private readonly _slotRepo: SlotRepository) {}

  async getMonthlySlots(doctorId: string, year: number, month: number) {
    return this._slotRepo.getSlotsByMonth(doctorId, year, month);
  }

  async updateDaySlot(doctorId: string, date: string, slots: { start: string; end: string }[], isCancelled: boolean) {
    return this._slotRepo.upsertSlot(doctorId, date, slots, isCancelled);
  }

  async deleteDaySlot(doctorId: string, date: string) {
    return this._slotRepo.deleteSlot(doctorId, date);
  }
}
