import { NotificationDTO } from '../../dtos/notification.dto';
import { toNotificationDTO } from '../../mappers/notification.mapper';
import { INotificationRepository } from '../../repositories/interface/INotificationRepository';
import { NotificationTypes } from '../../types/notificationTypes';
import { INotificationService } from '../interface/INotificationService';

export class NotificationService implements INotificationService {
  constructor(private readonly _notificationRepository: INotificationRepository) {}

  async sendNotification(payload: Partial<NotificationTypes>): Promise<NotificationDTO> {
    const doc = await this._notificationRepository.createNotification(payload);
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
      this._notificationRepository.getNotificationsPaged(
        recipientId,
        recipientRole,
        limit,
        skip,
        type
      ),
      this._notificationRepository.countAll(recipientId, recipientRole, type),
    ]);

    return {
      notifications: notifications.map(toNotificationDTO),
      total,
    };
  }

  async getUnreadCount(recipientId: string, recipientRole: string): Promise<number> {
    return this._notificationRepository.countUnread(recipientId.toString(), recipientRole);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this._notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await this._notificationRepository.markAllAsRead(recipientId, recipientRole);
  }

  async clearAll(recipientId: string, recipientRole: string, type?: string): Promise<void> {
    await this._notificationRepository.deleteAll(recipientId, recipientRole, type);
  }
}
