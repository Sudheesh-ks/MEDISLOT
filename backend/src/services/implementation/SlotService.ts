import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
import { ISlotService } from '../interface/ISlotService';
import { SlotRange } from '../../types/Slots';
import { ISlotRepository } from '../../repositories/interface/ISlotRepository';
import { slotDTO } from '../../dtos/Slot.dto';
import { toSlotDTO } from '../../mappers/Slot.mapper';

dayjs.extend(customParse);

export class SlotService implements ISlotService {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async getMonthlySlots(doctorId: string, year: number, month: number): Promise<slotDTO[]> {
    const slots = await this._slotRepository.getSlotsByMonth(doctorId, year, month);
    return slots.map(toSlotDTO);
  }

  async reserveSlotForAppointment(
    doctorId: string,
    slotDate: string,
    slotStartTime: string,
    slotEndTime: string,
    session?: any
  ): Promise<void> {
    let slotDoc = await this._slotRepository.getSlotByDate(doctorId, slotDate, session);

    let slotIndex = -1;

    if (slotDoc && !slotDoc.isCancelled) {
      slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime && !slot.booked
      );
    }

    if (slotIndex === -1) {
      const weekday = dayjs(slotDate).day();
      const weeklyDefault = await this._slotRepository.getDefaultSlotByWeekday(
        doctorId,
        weekday,
        session
      );

      if (!weeklyDefault) {
        throw new Error('Slot not available');
      }

      const defIndex = weeklyDefault.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime && slot.isAvailable
      );

      if (defIndex === -1) {
        throw new Error('Slot not available');
      }

      slotDoc = await this._slotRepository.upsertSlot(
        doctorId,
        slotDate,
        weeklyDefault.slots.map((s) => ({
          start: s.start,
          end: s.end,
          isAvailable: s.isAvailable,
          booked: false,
        })),
        false,
        undefined,
        false,
        session
      );

      if (!slotDoc) {
        throw new Error('Failed to create or fetch slot document');
      }

      slotIndex = slotDoc.slots.findIndex(
        (slot) => slot.start === slotStartTime && slot.end === slotEndTime
      );
    }

    if (slotIndex === -1) throw new Error('Slot not available');

    await this._slotRepository.markSlotBooked(
      doctorId,
      slotDate,
      slotStartTime,
      slotEndTime,
      session
    );
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

  async updateDaySlot(
    doctorId: string,
    date: string,
    slots: SlotRange[],
    isCancelled: boolean
  ): Promise<slotDTO> {
    this.validateRanges(slots);
    const slot = await this._slotRepository.upsertSlot(doctorId, date, slots, isCancelled);
    if (!slot) throw new Error('Slot not found or could not be created');
    return toSlotDTO(slot);
  }

  async deleteDaySlot(doctorId: string, date: string): Promise<slotDTO> {
    const slot = await this._slotRepository.deleteSlot(doctorId, date);
    if (!slot) throw new Error('Slot not found or could not be created');
    return toSlotDTO(slot);
  }

  async getDayAvailability(doctorId: string, date: string, userId?: string): Promise<SlotRange[]> {
    const override = await this._slotRepository.getSlotByDate(doctorId, date);

    const isExpired = (slot: any) =>
      !slot.locked || !slot.lockExpiresAt || new Date(slot.lockExpiresAt) < new Date();

    const isAllowed = (slot: any) => isExpired(slot) || slot.lockedBy === userId;

    if (override?.slots?.length) {
      return override.slots.filter((slot: any) => !slot.booked && isAllowed(slot));
    }

    const weekday = dayjs(date).day();
    const defaults = await this._slotRepository.getDefaultSlotByWeekday(doctorId, weekday);

    if (defaults?.slots?.length) {
      return defaults.slots.filter((slot: any) => !slot.booked && isAllowed(slot));
    }

    return [];
  }

  async updateDefaultSlot(
    doctorId: string,
    weekday: number,
    slots: SlotRange[],
    isCancelled: boolean
  ): Promise<slotDTO> {
    this.validateRanges(slots);
    const slot = await this._slotRepository.upsertSlot(
      doctorId,
      null,
      slots,
      isCancelled,
      weekday,
      true
    );
    if (!slot) throw new Error('Slot not found or could not be created');
    return toSlotDTO(slot);
  }

  async getDefaultSlot(doctorId: string, weekday: number): Promise<slotDTO> {
    const slot = await this._slotRepository.getDefaultSlot(doctorId, weekday);
    if (!slot) throw new Error('Slot not found or could not be created');
    return toSlotDTO(slot);
  }

  async unbookSlot(doctorId: string, date: string, start: string, end: string): Promise<void> {
    await this._slotRepository.unbookSlot(doctorId, date, start, end);
  }

  async lockSlot(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string
  ): Promise<{ success: boolean; expiresAt: Date }> {
    const slotDoc = await this._slotRepository.getSlotByDate(doctorId, date);
    if (!slotDoc) throw new Error('No slots found');

    const slot = slotDoc.slots.find((s: any) => s.start === start && s.end === end);
    if (!slot) throw new Error('Slot not found');
    if (slot.booked) throw new Error('Slot already booked');
    if (
      slot.locked &&
      slot.lockExpiresAt &&
      new Date(slot.lockExpiresAt) > new Date() &&
      slot.lockedBy?.toString() !== userId.toString()
    ) {
      throw new Error('Slot temporarily locked by another user');
    }

    const lockDuration = 5 * 60 * 1000;
    const expiresAt = new Date(Date.now() + lockDuration);

    await this._slotRepository.lockSlotRecord(doctorId, date, start, end, userId, expiresAt);

    return { success: true, expiresAt };
  }

  async releaseSlotLock(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    session?: any
  ): Promise<void> {
    await this._slotRepository.releaseSlotLock(doctorId, date, start, end, userId, session);
  }
}
