import { FeedbackDocument } from '../../models/FeedbackModel';

export interface IFeedbackRepository {
  submitFeedback(
    userId: string,
    apptId: string,
    message: string,
    rating: number
  ): Promise<FeedbackDocument>;
  getFeedbacks(doctorId: string): Promise<FeedbackDocument[]>;
  countFeedbacks(): Promise<number>;
}
