import { userTypes } from './user';

export interface feedbackTypes {
  _id?: string;
  userId: string;
  apptId: string;
  userData: userTypes;
  message: string;
  rating: number;
  timestamp: Date;
  isRead: boolean;
}
