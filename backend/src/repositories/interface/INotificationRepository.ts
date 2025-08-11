import { NotificationDocument } from '../../models/notificationModel';
import { NotificationTypes } from '../../types/notificationTypes';

export interface INotificationRepository {
  createNotification(data: Partial<NotificationTypes>): Promise<NotificationDocument>;
  getNotifications(
    recipientId: string,
    recipientRole: string,
    limit: number,
    before?: Date,
    type?: string
  ): Promise<NotificationDocument[]>;
  countUnread(recipientId: string, recipientRole: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
}
