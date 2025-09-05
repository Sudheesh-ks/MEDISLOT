import { FeedbackDTO } from '../dtos/feedback.dto';
import { FeedbackDocument } from '../models/feedbackModel';

export const toFeedbackDTO = (feedback: FeedbackDocument): FeedbackDTO => {
  return {
    _id: feedback._id.toString(),
    userId: feedback.userId,
    apptId: feedback.apptId,
    userData: feedback.userData,
    message: feedback.message,
    rating: feedback.rating,
    timestamp: feedback.timestamp,
    isRead: feedback.isRead,
  };
};
