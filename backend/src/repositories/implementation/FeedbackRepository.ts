import feedbackModel, { FeedbackDocument } from '../../models/FeedbackModel';
import { BaseRepository } from '../BaseRepository';
import { IFeedbackRepository } from '../interface/IFeedbackRepository';

export class FeedbackRepository
  extends BaseRepository<FeedbackDocument>
  implements IFeedbackRepository
{
  constructor() {
    super(feedbackModel);
  }

  async submitFeedback(
    userId: string,
    apptId: string,
    doctorId: string,
    userData: {
      name: string;
      email: string;
    },
    message: string,
    rating: number
  ): Promise<FeedbackDocument> {
    const feedback = new this.model({
      userId,
      apptId,
      doctorId,
      userData,
      message,
      rating,
      timestamp: new Date(),
      isRead: false,
    });

    return await feedback.save();
  }

  async getFeedbacks(doctorId: string): Promise<FeedbackDocument[]> {
    return this.model.find({ doctorId }).sort({ timestamp: -1 });
  }

  async countFeedbacks(): Promise<number> {
    return this.model.countDocuments({ isRead: false });
  }
}
