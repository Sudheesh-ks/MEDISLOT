import slotModel from '../../models/slotModel';

export class SlotRepository {
  async getSlotsByDoctor(doctorId: string): Promise<any> {
    return slotModel.find({ doctorId }).sort({ date: 1 }).exec();
  }

  async getSlotsByMonth(doctorId: string, year: number, month: number): Promise<any> {
    const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    return slotModel
      .find({
        doctorId,
        date: { $gte: start, $lte: end },
      })
      .exec();
  }

  async upsertSlot(
    doctorId: string,
    date: string | null,
    slots: { start: string; end: string; isAvailable?: boolean }[],
    isCancelled: boolean,
    weekday?: number,
    isDefault: boolean = false
  ): Promise<any> {
    const query: any = { doctorId };
    if (date) query.date = date;
    if (isDefault && weekday !== undefined) {
      query.weekday = weekday;
      query.isDefault = true;
    }

    return slotModel.findOneAndUpdate(
      query,
      { slots, isCancelled, isDefault, weekday },
      { upsert: true, new: true }
    );
  }

  async deleteSlot(doctorId: string, date: string): Promise<any> {
    return slotModel.findOneAndDelete({ doctorId, date });
  }

  async getSlotByDate(doctorId: string, date: string): Promise<any> {
    return slotModel.findOne({ doctorId, date }).exec();
  }

  async getDefaultSlotByWeekday(doctorId: string, weekday: number): Promise<any> {
    return slotModel.findOne({ doctorId, weekday, isDefault: true }).exec();
  }

  async getDefaultSlot(doctorId: string, weekday: number): Promise<any> {
    const doc = await slotModel.findOne({ doctorId, weekday }).exec();
    return doc ? doc.slots : [];
  }
}
