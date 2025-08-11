import { NotificationDTO } from '../../dtos/notification.dto';
import { NotificationTypes } from '../../types/notificationTypes';

export interface INotificationService {
  sendNotification(payload: Partial<NotificationTypes>): Promise<NotificationDTO>;
  fetchNotificationHistory(
    recipientId: string,
    recipientRole: string,
    limit: number,
    before?: Date,
    type?: string
  ): Promise<NotificationDTO[]>;
  getUnreadCount(recipientId: string, recipientRole: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
}
