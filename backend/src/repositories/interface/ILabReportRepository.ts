import { LabReportDocument } from '../../models/labReportModel';
import { LabReportTypes } from '../../types/lab';

export interface ILabReportRepository {
  createReport(data: Partial<LabReportTypes>): Promise<LabReportDocument>;
  findByBookingId(bookingId: string): Promise<LabReportDocument | null>;
  findByUserId(userId: string): Promise<LabReportDocument[]>;
}
