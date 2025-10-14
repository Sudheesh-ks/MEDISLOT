export interface ISlotRepository {
  getSlotsByDoctor(doctorId: string): Promise<any[]>;
  getSlotsByMonth(doctorId: string, year: number, month: number): Promise<any[]>;
  upsertSlot(
    doctorId: string,
    date: string | null,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean,
    weekday?: number,
    isDefault?: boolean
  ): Promise<any>;
  deleteSlot(doctorId: string, date: string): Promise<any>;
  getSlotByDate(doctorId: string, date: string): Promise<any>;
  getDefaultSlotByWeekday(doctorId: string, weekday: number): Promise<any>;
  getDefaultSlot(doctorId: string, weekday: number): Promise<any>;
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
