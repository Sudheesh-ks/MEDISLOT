import { Types } from 'mongoose';

export interface ComplaintTypes {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  doctorId?: Types.ObjectId;
  subject: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: Date;
}
