import { userTypes } from './User';

export interface feedbackTypes {
  _id?: string;
  userId: string;
  apptId: string;
  doctorId: string;
  userData: userTypes;
  message: string;
  rating: number;
  timestamp: Date;
  isRead: boolean;
}
