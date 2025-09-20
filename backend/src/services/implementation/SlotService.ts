import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
import { ISlotService } from '../interface/ISlotService';
import { SlotRange } from '../../types/slots';
import { ISlotRepository } from '../../repositories/interface/ISlotRepository';

dayjs.extend(customParse);

export class DoctorSlotService implements ISlotService {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async getMonthlySlots(doctorId: string, year: number, month: number) {
    return this._slotRepository.getSlotsByMonth(doctorId, year, month);
  }

  private validateRanges(ranges: SlotRange[]) {
    const fmt = (t: string) => dayjs(t, 'HH:mm');
    const sorted = [...ranges].sort((a, b) => fmt(a.start).valueOf() - fmt(b.start).valueOf());

    for (let i = 0; i < sorted.length; i++) {
      const r = sorted[i];
      if (!fmt(r.end).isAfter(fmt(r.start))) {
        throw new Error('End time must be after start time');
      }
      if (i > 0 && fmt(r.start).isBefore(fmt(sorted[i - 1].end))) {
        throw new Error('Time ranges cannot overlap');
      }
    }
  }

  async updateDaySlot(doctorId: string, date: string, slots: SlotRange[], isCancelled: boolean) {
    this.validateRanges(slots);
    return this._slotRepository.upsertSlot(doctorId, date, slots, isCancelled);
  }

  async deleteDaySlot(doctorId: string, date: string) {
    return this._slotRepository.deleteSlot(doctorId, date);
  }

  async getDayAvailability(doctorId: string, date: string) {
    const override = await this._slotRepository.getSlotByDate(doctorId, date);
    if (override) return override.slots;

    const weekday = dayjs(date).day();
    const defaults = await this._slotRepository.getDefaultSlotByWeekday(doctorId, weekday);
    return defaults?.slots ?? [];
  }

  async updateDefaultSlot(
    doctorId: string,
    weekday: number,
    slots: SlotRange[],
    isCancelled: boolean
  ): Promise<any> {
    this.validateRanges(slots);
    return this._slotRepository.upsertSlot(doctorId, null, slots, isCancelled, weekday, true);
  }

  async getDefaultSlot(doctorId: string, weekday: number): Promise<any> {
    return this._slotRepository.getDefaultSlot(doctorId, weekday);
  }
}
