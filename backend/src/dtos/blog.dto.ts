import { DoctorDTO } from './doctor.dto';
import { UserDTO } from './user.dto';

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
  comments: {
    userData: UserDTO;
    text: string;
    createdAt: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
