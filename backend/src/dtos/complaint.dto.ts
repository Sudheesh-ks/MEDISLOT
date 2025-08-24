export interface ComplaintDTO {
  _id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  createdAt?: Date;
  userData: {
    name: string;
    email: string;
  };
}
