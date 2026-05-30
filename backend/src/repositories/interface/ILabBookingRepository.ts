import { LabBookingDocument } from '../../models/labBookingModel';
import { LabBookingTypes } from '../../types/lab';
import { PaginationResult } from '../../types/pagination';

export interface ILabBookingRepository {
  createBooking(data: Partial<LabBookingTypes>): Promise<LabBookingDocument>;
  findById(id: string): Promise<LabBookingDocument | null>;
  findByBookingId(bookingId: string): Promise<LabBookingDocument | null>;
  findByRazorpayOrderId(orderId: string): Promise<LabBookingDocument | null>;
  updateBookingById(id: string, data: Partial<LabBookingTypes>): Promise<void>;
  getBookingsByUserId(userId: string): Promise<LabBookingDocument[]>;
  getBookingsByLabIdPaginated(
    labId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string,
    dateRange?: string
  ): Promise<PaginationResult<LabBookingDocument>>;
  getAllBookingsPaginated(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    dateRange?: string
  ): Promise<PaginationResult<LabBookingDocument>>;
  getRevenueOverTime(
    labId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; revenue: number }[]>;
  getBookingsOverTime(
    labId: string,
    start?: string,
    end?: string
  ): Promise<{ date: string; count: number }[]>;
}
