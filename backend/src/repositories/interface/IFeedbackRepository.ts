import { FeedbackDocument } from '../../models/feedbackModel';

export interface IFeedbackRepository {
  submitFeedback(userId: string, apptId: string, message: string): Promise<FeedbackDocument>;
  getFeedbacks(doctorId: string): Promise<FeedbackDocument[]>;
  countFeedbacks(): Promise<number>;
}
