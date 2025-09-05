import appointmentModel from '../../models/appointmentModel';
import doctorModel from '../../models/doctorModel';
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

  // FeedbackRepository.ts
  async submitFeedback(
    userId: string,
    apptId: string,
    message: string,
    rating: number
  ): Promise<FeedbackDocument> {
    const user = await userModel.findById(userId).lean();
    if (!user) throw new Error('User not found');

    const appointment = await appointmentModel.findById(apptId).lean();
    if (!appointment) throw new Error('Appointment not found');

    const feedback = new this.model({
      userId,
      apptId,
      doctorId: appointment.docId,
      userData: {
        name: user.name,
        email: user.email,
      },
      message,
      rating,
      timestamp: new Date(),
      isRead: false,
    });

    const saved = await feedback.save();

    // Update doctor's average rating
    const doctor = await doctorModel.findById(appointment.docId);
    if (doctor) {
      doctor.ratingCount! += 1;
      doctor.averageRating =
        (doctor.averageRating! * (doctor.ratingCount! - 1) + rating) / doctor.ratingCount!;
      await doctor.save();
    }

    return saved;
  }

  async getFeedbacks(doctorId: string): Promise<FeedbackDocument[]> {
    return this.model.find({ doctorId }).sort({ timestamp: -1 });
  }

  async countFeedbacks(): Promise<number> {
    return this.model.countDocuments({ isRead: false });
  }
}
