export interface SlotRange {
  start: string;
  end: string;
  isAvailable: boolean;
  booked: boolean;
}

interface Slot {
  slotTime: string;
  isBooked: boolean;
}
