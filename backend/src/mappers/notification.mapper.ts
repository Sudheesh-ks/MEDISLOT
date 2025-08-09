import { NotificationDTO } from "../dtos/notification.dto";
import { NotificationDocument } from "../models/notificationModel";

export const toNotificationDTO = (doc: NotificationDocument): NotificationDTO => ({
  _id: doc._id.toString(),
  recipientId: doc.recipientId,
  recipientRole: doc.recipientRole,
  type: doc.type,
  title: doc.title,
  message: doc.message,
  link: doc.link,
  isRead: doc.isRead,
  createdAt: doc.createdAt,
});