import ComplaintModel, { ComplaintDocument } from '../../models/complaintModel';
import userModel from '../../models/userModel';
import { BaseRepository } from '../BaseRepository';
import { IComplaintRepository } from '../interface/IComplaintRepository';

export class ComplaintRepository
  extends BaseRepository<ComplaintDocument>
  implements IComplaintRepository
{
  constructor() {
    super(ComplaintModel);
  }


  async findComplaintById(id: string): Promise<ComplaintDocument | null> {
    const complaint = await this.findById(id);
    return complaint;
  }

  async reportIssue(
    userId: string,
    subject: string,
    description: string
  ): Promise<ComplaintDocument> {
    const user = await userModel.findById(userId).lean();
    if (!user) throw new Error('User not found');

    const issue = new this.model({
      userId,
      subject,
      description,
      status: 'pending',
    });
    return issue.save();
  }

  async getComplaints(page: number = 1, limit: number = 10): Promise<ComplaintDocument[]> {
    const skip = (page - 1) * limit;
    return this.model
      .find()
      .populate('userId', 'name email')
      .sort({ timeStamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countComplaints(): Promise<number> {
    return this.model.countDocuments({ status: 'unread' });
  }

  async updateComplaintStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  ): Promise<ComplaintDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'name email')
      .lean();
  }
}
