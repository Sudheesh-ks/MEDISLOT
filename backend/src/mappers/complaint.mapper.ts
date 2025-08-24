import { ComplaintDTO } from '../dtos/complaint.dto';
// import { ComplaintDocument } from '../models/complaintModel';

export const tocomplaintDTO = (complaint: any): ComplaintDTO => {
  return {
    _id: complaint._id.toString(),
    userId: complaint.userId.toString(),
    subject: complaint.subject,
    description: complaint.description,
    status: complaint.status,
    createdAt: complaint.createdAt,
    userData: {
      name: complaint.userId?.name || 'Unknown',
      email: complaint.userId?.email || 'N/A',
    },
  };
};
