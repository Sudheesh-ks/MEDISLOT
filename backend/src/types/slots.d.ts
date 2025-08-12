export interface slotTypes {
  _id?: string;
  doctorId: object;
  date: string;
  slots: {
    isAvailable: boolean;
    start: string;
    end: string;
    booked: boolean;
  }[];
  isCancelled: boolean;
}

export interface SlotRange {
  start: string;
  end: string;
  isAvailable: boolean;
  booked: boolean;
}
