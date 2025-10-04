import NotificationModel, { NotificationDocument } from '../../models/notificationModel';
import { NotificationTypes } from '../../types/notificationTypes';
import { BaseRepository } from '../BaseRepository';
import { INotificationRepository } from '../interface/INotificationRepository';

export class NotificationRepository extends BaseRepository<NotificationDocument> implements INotificationRepository {
  async createNotification(data: Partial<NotificationTypes>): Promise<NotificationDocument> {
    return NotificationModel.create(data);
  }

  async getNotificationsPaged(
    recipientId: string,
    recipientRole: string,
    limit: number,
    skip: number,
    type?: string
  ): Promise<NotificationDocument[]> {
    const query: any = { recipientId, recipientRole, isDeleted: false };
    if (type) query.type = type;

    return NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async countAll(recipientId: string, recipientRole: string, type?: string): Promise<number> {
    const query: any = { recipientId, recipientRole, isDeleted: false };
    if (type) query.type = type;

    return NotificationModel.countDocuments(query);
  }

  async countUnread(recipientId: string, recipientRole: string): Promise<number> {
    console.log(recipientId, recipientRole);

    console.log(recipientId, recipientRole);
    return NotificationModel.countDocuments({
      recipientId,
      recipientRole,
      isRead: false,
      isDeleted: false,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId, recipientRole, isRead: false, isDeleted: false },
      { isRead: true }
    );
  }

  async deleteAll(recipientId: string, recipientRole: string, type?: string): Promise<void> {
    const query: any = { recipientId, recipientRole, isDeleted: false };
    if (type) query.type = type;

    await NotificationModel.updateMany(query, { $set: { isDeleted: true } });
  }
}
