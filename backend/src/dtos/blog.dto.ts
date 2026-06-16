import { DoctorDTO } from './Doctor.dto';
import { UserDTO } from './User.dto';

export interface BlogDTO {
  id: string;
  doctorData?: DoctorDTO;
  title: string;
  summary: string;
  content: string;
  category: string;
  readTime?: string;
  image?: string | Express.Multer.File;
  tags: string[];
  visibility: 'public' | 'private' | 'members';
  publishDate?: Date;
  likes?: Array<any>;
  comments: {
    userData: UserDTO;
    text: string;
    createdAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
