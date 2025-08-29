import { NotificationDocument } from '../../models/notificationModel';
import { NotificationTypes } from '../../types/notificationTypes';

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
  countUnread(recipientRole: string, recipientId?: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  deleteAll(recipientId: string, recipientRole: string, type?: string): Promise<void>;
}
