import { UserDTO } from './user.dto';

export interface FeedbackDTO {
  _id?: string;
  userId: string;
  apptId: string;
  userData: UserDTO;
  message: string;
  rating: number;
  timestamp: Date;
  isRead: boolean;
}
