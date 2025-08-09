import NotificationModel, { NotificationDocument } from "../../models/notificationModel";
import { NotificationTypes } from "../../types/notificationTypes";
import { INotificationRepository } from "../interface/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  async createNotification(data: Partial<NotificationTypes>): Promise<NotificationDocument> {
    return NotificationModel.create(data);
  }

  async getNotifications(
    recipientId: string,
    recipientRole: string,
    limit = 10,
    before?: Date,
    type?: string
  ): Promise<NotificationDocument[]> {
    const query: any = { recipientId, recipientRole };
    if (before) query.createdAt = { $lt: before };
    if (type) query.type = type;

    return NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countUnread(recipientId: string, recipientRole: string): Promise<number> {
    return NotificationModel.countDocuments({ recipientId, recipientRole, isRead: false });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }

  async markAllAsRead(recipientId: string, recipientRole: string): Promise<void> {
    await NotificationModel.updateMany({ recipientId, recipientRole, isRead: false }, { isRead: true });
  }
}