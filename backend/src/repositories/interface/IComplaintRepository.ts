import { ComplaintDocument } from '../../models/complaintModel';

export interface IComplaintRepository {
  findComplaintById(id: string): Promise<ComplaintDocument | null>;
  reportIssue(userId: string, subject: string, description: string): Promise<ComplaintDocument>;
  getComplaints(
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<ComplaintDocument[]>;
  countComplaints(search: string, status: string): Promise<number>;
  updateComplaintStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
  ): Promise<ComplaintDocument | null>;
  reportDoctorIssue(
    doctorId: string,
    subject: string,
    description: string
  ): Promise<ComplaintDocument>;
}
