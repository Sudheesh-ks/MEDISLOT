import { BlogDTO } from '../dtos/Blog.dto';
import { BlogDocument } from '../models/BlogModel';
import { toDoctorDTO } from './Doctor.mapper';
import { toUserDTO } from './User.mapper';

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
