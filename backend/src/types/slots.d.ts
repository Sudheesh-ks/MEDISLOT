export interface slotTypes {
  _id?: string;
  doctorId: object;
  date: string;
  weekday: number;
  slots: {
    isAvailable: boolean;
    start: string;
    end: string;
    booked: boolean;
  }[];
  isCancelled: boolean;
  isDefault: boolean;
}

export interface SlotRange {
  start: string;
  end: string;
  isAvailable: boolean;
  booked: boolean;
}
