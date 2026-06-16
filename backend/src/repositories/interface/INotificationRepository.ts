import { NotificationDocument } from '../../models/NotificationModel';
import { NotificationTypes } from '../../types/NotificationTypes';

export interface INotificationRepository {
  createNotification(data: Partial<NotificationTypes>): Promise<NotificationDocument>;
  getNotificationsPaged(
    recipientId: string,
    recipientRole: string,
    limit: number,
    skip: number,
    type?: string
  ): Promise<NotificationDocument[]>;
  countAll(recipientId: string, recipientRole: string, type?: string): Promise<number>;
  countUnread(recipientId: string, recipientRole: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  deleteAll(recipientId: string, recipientRole: string, type?: string): Promise<void>;
}
