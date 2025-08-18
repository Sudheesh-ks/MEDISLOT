import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { BlogTypes } from '../types/blog';

export interface BlogDocument extends Omit<BlogTypes, '_id'>, Document {
  _id: Types.ObjectId;
}

const blogSchema: Schema<BlogDocument> = new mongoose.Schema(
  {
    doctorId: { type: String, required: true },
    doctorData: { type: Object, required: true },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    readTime: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'members'],
      default: 'public',
    },
    publishDate: {
      type: Date,
    },
    comments: [
      {
        userId: { type: String, required: true },
        userData: { type: Object, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const BlogModel: Model<BlogDocument> = mongoose.model<BlogDocument>('Blog', blogSchema);

export default BlogModel;
