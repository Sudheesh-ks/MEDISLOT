import feedbackModel, { FeedbackDocument } from '../../models/feedbackModel';
import userModel from '../../models/userModel';
import { BaseRepository } from '../BaseRepository';
import { IFeedbackRepository } from '../interface/IFeedbackRepository';

export class FeedbackRepository
  extends BaseRepository<FeedbackDocument>
  implements IFeedbackRepository
{
  constructor() {
    super(feedbackModel);
  }

  async submitFeedback(userId: string, apptId: string, message: string): Promise<FeedbackDocument> {
    const user = await userModel.findById(userId).lean();
    if (!user) throw new Error('User not found');
    const feedback = new this.model({
      userId,
      apptId,
      userData: {
        name: user.name,
        email: user.email,
      },
      message,
      timestamp: new Date(),
      isRead: false,
    });
    return feedback.save();
  }

  async getFeedbacks(): Promise<FeedbackDocument[]> {
    return this.model.find().sort({ timestamp: -1 });
  }

  async countFeedbacks(): Promise<number> {
    return this.model.countDocuments({ isRead: false });
  }
}
