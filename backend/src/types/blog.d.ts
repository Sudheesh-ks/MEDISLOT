import { userDocument } from '../models/userModel';
import { DoctorDocument } from '../models/doctorModel';

export interface CommentType {
  userId: string;
  userData: userDocument;
  text: string;
  createdAt?: Date;
}
export interface BlogTypes {
  _id?: string;
  doctorId: string;
  doctorData?: DoctorDocument;
  title: string;
  summary: string;
  content: string;
  category: string;
  readTime?: string;
  image?: string | Express.Multer.File;
  tags: string[];
  visibility: 'public' | 'private' | 'members';
  publishDate?: Date;
  likes?: Array;
  comments?: CommentType[];
  createdAt?: Date;
  updatedAt?: Date;
}
