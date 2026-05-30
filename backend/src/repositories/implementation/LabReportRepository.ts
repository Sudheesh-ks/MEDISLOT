import { ILabReportRepository } from '../interface/ILabReportRepository';
import labReportModel, { LabReportDocument } from '../../models/labReportModel';
import { BaseRepository } from '../BaseRepository';
import { LabReportTypes } from '../../types/lab';

export class LabReportRepository extends BaseRepository<LabReportDocument> implements ILabReportRepository {
  constructor() {
    super(labReportModel);
  }

  async createReport(data: Partial<LabReportTypes>): Promise<LabReportDocument> {
    return this.create(data);
  }

  async findByBookingId(bookingId: string): Promise<LabReportDocument | null> {
    return labReportModel.findOne({ bookingId }).exec();
  }

  async findByUserId(userId: string): Promise<LabReportDocument[]> {
    return labReportModel.find({ userId }).exec();
  }
}
