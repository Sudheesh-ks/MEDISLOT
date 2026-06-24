export interface NotificationTypes {
  _id?: string;
  recipientId: string;
  recipientRole: 'user' | 'doctor' | 'admin';
  type: 'appointment' | 'system' | 'prescription';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
