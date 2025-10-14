import { FilterQuery } from 'mongoose';
import slotModel, { SlotDocument } from '../../models/slotModel';
import { BaseRepository } from '../BaseRepository';
import { ISlotRepository } from '../interface/ISlotRepository';
import { SlotRange } from '../../types/slots';

export class SlotRepository extends BaseRepository<SlotDocument> implements ISlotRepository {
  constructor() {
    super(slotModel);
  }

  async getSlotsByDoctor(doctorId: string): Promise<SlotDocument[]> {
    return slotModel.find({ doctorId }).sort({ date: 1 }).exec();
  }

  async getSlotsByMonth(doctorId: string, year: number, month: number): Promise<SlotDocument[]> {
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
  ): Promise<SlotDocument | null> {
    const query: FilterQuery<SlotDocument> = { doctorId };
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

  async deleteSlot(doctorId: string, date: string): Promise<SlotDocument | null> {
    return slotModel.findOneAndDelete({ doctorId, date });
  }

  async getSlotByDate(doctorId: string, date: string): Promise<SlotDocument | null> {
    return slotModel.findOne({ doctorId, date }).exec();
  }

  async getDefaultSlotByWeekday(doctorId: string, weekday: number): Promise<SlotDocument | null> {
    return slotModel.findOne({ doctorId, weekday, isDefault: true }).exec();
  }

  async getDefaultSlot(doctorId: string, weekday: number): Promise<SlotRange[]> {
    const doc = await slotModel.findOne({ doctorId, weekday }).exec();
    return doc ? doc.slots : [];
  }

  async lockSlotRecord(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    lockExpiresAt: Date
  ): Promise<void> {
    await slotModel.updateOne(
      { doctorId, date, 'slots.start': start, 'slots.end': end },
      {
        $set: {
          'slots.$.locked': true,
          'slots.$.lockedBy': userId,
          'slots.$.lockExpiresAt': lockExpiresAt,
        },
      }
    );
  }

  async markSlotBooked(doctorId: string, date: string, start: string, end: string): Promise<void> {
    await slotModel.updateOne(
      { doctorId, date, 'slots.start': start, 'slots.end': end },
      {
        $set: {
          'slots.$.booked': true,
          'slots.$.locked': false,
          'slots.$.lockedBy': null,
          'slots.$.lockExpiresAt': null,
        },
      }
    );
  }
}
