import { BlogDTO } from '../dtos/blog.dto';
import { BlogDocument } from '../models/blogModel';
import { toDoctorDTO } from './doctor.mapper';
import { toUserDTO } from './user.mapper';

export const toBlogDTO = (blog: BlogDocument): BlogDTO => {
  return {
    id: blog._id?.toString() || '',
    doctorData: toDoctorDTO(blog.doctorData!),
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    category: blog.category,
    readTime: blog.readTime,
    image: blog.image,
    tags: blog.tags,
    visibility: blog.visibility,
    publishDate: blog.publishDate,
    comments:
      blog.comments?.map((c: any) => ({
        userData: toUserDTO(c.userData),
        text: c.text,
        createdAt: c.createdAt,
      })) || [],
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};
