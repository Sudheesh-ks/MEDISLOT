import { ReviewDocument } from '../../models/reviewModel';
import { ReviewTypes } from '../../types/lab';

export interface IReviewRepository {
  createReview(data: Partial<ReviewTypes>): Promise<ReviewDocument>;
  findByLabId(labId: string): Promise<ReviewDocument[]>;
  findByBookingId(bookingId: string): Promise<ReviewDocument | null>;
  getAverageRatingForLab(labId: string): Promise<{ averageRating: number; count: number }>;
}
