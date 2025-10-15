import { NotificationDTO } from '../../dtos/notification.dto';
import { toNotificationDTO } from '../../mappers/notification.mapper';
import { INotificationRepository } from '../../repositories/interface/INotificationRepository';
import { ioInstance } from '../../sockets/ChatSocket';
import { NotificationTypes } from '../../types/notificationTypes';
import { INotificationService } from '../interface/INotificationService';

export class NotificationService implements INotificationService {
  constructor(private readonly _notificationRepository: INotificationRepository) {}

  async sendNotification(payload: Partial<NotificationTypes>): Promise<NotificationDTO> {
    // 1️⃣ Create notification in DB
    const doc = await this._notificationRepository.createNotification(payload);
    const dto = toNotificationDTO(doc);

    try {
      // 2️⃣ Count unread notifications
      const unreadCount = await this._notificationRepository.countUnread(
        payload.recipientId!.toString(),
        payload.recipientRole!
      );

      // 3️⃣ Emit events (only if socket server is running)
      if (ioInstance) {
        ioInstance.to(payload.recipientId!.toString()).emit('notificationCountUpdate', {
          unreadCount,
        });

        ioInstance.to(payload.recipientId!.toString()).emit('newNotification', {
          title: payload.title,
          message: payload.message,
          link: payload.link,
          type: payload.type,
        });
      }
    } catch (err) {
      console.error('Socket emit failed:', err);
    }

    return dto;
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

        if (ioInstance) {
      ioInstance.to(recipientId.toString()).emit('notificationCountUpdate', { unreadCount: 0 });
    }
  }

  async clearAll(recipientId: string, recipientRole: string, type?: string): Promise<void> {
    await this._notificationRepository.deleteAll(recipientId, recipientRole, type);
  }
}
