import { FeedbackDTO } from '../dtos/feedback.dto';
import { FeedbackDocument } from '../models/feedbackModel';
import { toUserDTO } from './user.mapper';

export const toFeedbackDTO = (feedback: FeedbackDocument): FeedbackDTO => {
  return {
    _id: feedback._id.toString(),
    userId: feedback.userId,
    apptId: feedback.apptId,
    userData: feedback.userData,
    message: feedback.message,
    timestamp: feedback.timestamp,
    isRead: feedback.isRead,
  };
};
