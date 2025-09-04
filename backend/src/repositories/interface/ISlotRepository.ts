export interface ISlotRepository {
  getSlotsByDoctor(doctorId: string): Promise<any[]>;
  getSlotsByMonth(doctorId: string, year: number, month: number): Promise<any[]>;
  upsertSlot(
    doctorId: string,
    date: string,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean
  ): Promise<any>;
  deleteSlot(doctorId: string, date: string): Promise<any>;
  getSlotByDate(doctorId: string, date: string): Promise<any>;
  getDefaultSlotByWeekday(doctorId: string, weekday: number): Promise<any>;
}
