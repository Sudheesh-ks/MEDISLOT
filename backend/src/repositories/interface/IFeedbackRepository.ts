import { FeedbackDocument } from '../../models/feedbackModel';

export interface IFeedbackRepository {
  submitFeedback(userId: string, apptId: string, message: string): Promise<FeedbackDocument>;
  getFeedbacks(skip: number, limit: number): Promise<FeedbackDocument[]>;
  countFeedbacks(): Promise<number>;
}
