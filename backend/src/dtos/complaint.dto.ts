export interface ComplaintDTO {
  _id: string;
  userId?: string;
  doctorId?: string;
  subject: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt?: Date;
  userData: {
    name: string;
    email: string;
  };
  docData: {
    name: string;
    email: string;
  };
}
