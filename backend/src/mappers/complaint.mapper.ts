import { ComplaintDTO } from '../dtos/complaint.dto';

export const tocomplaintDTO = (complaint: any): ComplaintDTO => {
  return {
    _id: complaint._id.toString(),
    userId: complaint.userId ? complaint.userId._id?.toString() : undefined,
    doctorId: complaint.doctorId ? complaint.doctorId._id?.toString() : undefined,
    subject: complaint.subject,
    description: complaint.description,
    status: complaint.status,
    createdAt: complaint.createdAt,
    userData: {
      name: complaint.userId?.name || 'Unknown',
      email: complaint.userId?.email || 'N/A',
    },
    docData: {
      name: complaint.doctorId?.name || 'Unknown',
      email: complaint.doctorId?.email || 'N/A',
    },
  };
};
