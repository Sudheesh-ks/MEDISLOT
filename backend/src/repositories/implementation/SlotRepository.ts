import mongoose, { FilterQuery } from 'mongoose';
import slotModel, { SlotDocument } from '../../models/SlotModel';
import { BaseRepository } from '../BaseRepository';
import { ISlotRepository } from '../interface/ISlotRepository';

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
    isDefault: boolean = false,
    session?: any
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
      { upsert: true, new: true, session }
    );
  }

  async deleteSlot(doctorId: string, date: string): Promise<SlotDocument | null> {
    return slotModel.findOneAndDelete({ doctorId, date });
  }

  async getSlotByDate(doctorId: string, date: string, session?: any): Promise<SlotDocument | null> {
    return slotModel.findOne({ doctorId, date }).session(session).exec();
  }

  async getDefaultSlotByWeekday(
    doctorId: string,
    weekday: number,
    session?: any
  ): Promise<SlotDocument | null> {
    return slotModel.findOne({ doctorId, weekday, isDefault: true }).session(session).exec();
  }

  async getDefaultSlot(doctorId: string, weekday: number): Promise<SlotDocument | null> {
    return slotModel.findOne({ doctorId, weekday }).exec();
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

  async markSlotBooked(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    session?: any
  ): Promise<void> {
    await slotModel.updateOne(
      { doctorId, date, 'slots.start': start, 'slots.end': end },
      {
        $set: {
          'slots.$.booked': true,
          'slots.$.locked': false,
          'slots.$.lockedBy': null,
          'slots.$.lockExpiresAt': null,
        },
      },
      { session }
    );
  }

  async getAvailableSlotsByDoctorAndMonth(
    doctorId: string,
    year: number,
    month: number
  ): Promise<SlotDocument[]> {
    const regexMonth = String(month).padStart(2, '0');
    const regex = new RegExp(`^${year}-${regexMonth}`);

    return slotModel
      .find({
        doctorId,
        date: { $regex: regex },
        isCancelled: false,
        'slots.booked': false,
      })
      .select('date slots');
  }

  async unbookSlot(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    session?: any
  ): Promise<void> {
    await slotModel.updateOne(
      {
        doctorId,
        date,
        'slots.start': start,
        'slots.end': end,
        'slots.booked': true,
      },
      {
        $set: {
          'slots.$.booked': false,
        },
      },
      { session }
    );
  }

  async releaseSlotLock(
    doctorId: string,
    date: string,
    start: string,
    end: string,
    userId: string,
    session?: any
  ): Promise<void> {
    await slotModel.updateOne(
      {
        doctorId,
        date,
        'slots.start': start,
        'slots.end': end,
        'slots.lockedBy': new mongoose.Types.ObjectId(userId),
      },
      {
        $set: {
          'slots.$.locked': false,
          'slots.$.lockedBy': null,
          'slots.$.lockExpiresAt': null,
        },
      },
      { session }
    );
  }
}
