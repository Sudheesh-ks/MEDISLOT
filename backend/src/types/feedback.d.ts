import { userTypes } from './user';

export interface feedbackTypes {
  _id?: string;
  userId: string;
  apptId: string;
  doctorId: string;
  userData: userTypes;
  message: string;
  timestamp: Date;
  isRead: boolean;
}
