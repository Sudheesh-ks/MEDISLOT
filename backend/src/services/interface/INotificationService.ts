import { NotificationDTO } from '../../dtos/notification.dto';
import { NotificationTypes } from '../../types/notificationTypes';

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
}
