import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { NotificationTypes } from '../types/notificationTypes';

export interface NotificationDocument extends Omit<NotificationTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const NotificationSchema: Schema<NotificationDocument> = new mongoose.Schema({
  recipientId: { type: String, required: true },
  recipientRole: { type: String, enum: ['user', 'doctor', 'admin'], required: true },
  type: { type: String, enum: ['appointment', 'system', 'prescription'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const NotificationModel: Model<NotificationDocument> = mongoose.model<NotificationDocument>(
  'Notification',
  NotificationSchema
);

export default NotificationModel;
