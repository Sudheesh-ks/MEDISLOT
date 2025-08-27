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

  async getComplaints(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = 'all'
  ): Promise<ComplaintDocument[]> {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return this.model
      .find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countComplaints(search: string = '', status: string = 'all'): Promise<number> {
    const query: any = {};

    if (status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return this.model.countDocuments(query);
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
