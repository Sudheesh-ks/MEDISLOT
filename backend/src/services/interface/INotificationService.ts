import { NotificationDTO } from '../../dtos/Notification.dto';
import { NotificationTypes } from '../../types/NotificationTypes';

export interface INotificationService {
  sendNotification(payload: Partial<NotificationTypes>): Promise<NotificationDTO>;
  fetchNotificationHistoryPaged(
    recipientId: string,
    recipientRole: string,
    page: number,
    limit: number,
    type?: string
  ): Promise<{ notifications: NotificationDTO[]; total: number }>;
  getUnreadCount(recipientId: string, recipientRole: string): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(recipientId: string, recipientRole: string): Promise<void>;
  clearAll(recipientId: string, recipientRole: string, type?: string): Promise<void>;
}
