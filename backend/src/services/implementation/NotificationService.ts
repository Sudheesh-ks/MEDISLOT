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

  async fetchNotificationHistory(
    recipientId: string,
    recipientRole: string,
    limit = 10,
    before?: Date,
    type?: string
  ): Promise<NotificationDTO[]> {
    const notifications = await this._repo.getNotifications(
      recipientId,
      recipientRole,
      limit,
      before,
      type
    );
    return notifications.map(toNotificationDTO);
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
