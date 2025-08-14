import { NotificationDTO } from '../../dtos/notification.dto';
import { toNotificationDTO } from '../../mappers/notification.mapper';
import { NotificationRepository } from '../../repositories/implementation/NotificationRepository';
import { NotificationTypes } from '../../types/notificationTypes';
import { INotificationService } from '../interface/INotificationService';

export class NotificationService implements INotificationService {
  constructor(private readonly _repo = new NotificationRepository()) {}

  async sendNotification(payload: Partial<NotificationTypes>): Promise<NotificationDTO> {
    const doc = await this._repo.createNotification(payload);
    return toNotificationDTO(doc);
  }

  async fetchNotificationHistoryPaged(
    recipientId: string,
    recipientRole: string,
    page = 1,
    limit = 10,
    type?: string
  ): Promise<{ notifications: NotificationDTO[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this._repo.getNotificationsPaged(recipientId, recipientRole, limit, skip, type),
      this._repo.countAll(recipientId, recipientRole, type),
    ]);

    return {
      notifications: notifications.map(toNotificationDTO),
      total,
    };
  }

  async getUnreadCount(recipientId: string, recipientRole: string): Promise<number> {
    return this._repo.countUnread(recipientId.toString(), recipientRole);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this._repo.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await this._repo.markAllAsRead(recipientId, recipientRole);
  }
}
