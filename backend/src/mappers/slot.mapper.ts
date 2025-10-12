import { slotDTO } from '../dtos/slot.dto';
import { SlotDocument } from '../models/slotModel';

export const toSlotDTO = (slot: SlotDocument): slotDTO => {
  return {
    _id: slot._id.toString(),
    doctorId: slot.doctorId,
    date: slot.date,
    weekday: slot.weekday,
    slots: slot.slots.map((s) => ({
      isAvailable: s.isAvailable,
      start: s.start,
      end: s.end,
      booked: s.booked,
    })),
    isCancelled: slot.isCancelled,
    isDefault: slot.isDefault,
  };
};
