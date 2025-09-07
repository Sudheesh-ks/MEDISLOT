import { BlogDTO } from '../../dtos/blog.dto';
import { BlogTypes } from '../../types/blog';

export interface IBlogService {
  createBlog(data: BlogTypes): Promise<BlogDTO>;
  getBlogById(id: string): Promise<BlogDTO | null>;
  getBlogsPaginated(
    page: number,
    limit: number
  ): Promise<{ blogs: BlogDTO[]; total: number; page: number; limit: number }>;
  getAllBlogs(): Promise<any>;
  getBlogsByDoctor(doctorId: string): Promise<BlogDTO[]>;
  updateBlog(id: string, doctorId: string, data: Partial<BlogTypes>): Promise<BlogDTO | null>;
  deleteBlog(blogId: string, doctorId: string): Promise<boolean>;
  getBlogComments(blogId: string): Promise<any>;
  addBlogComment(blogId: string, userId: string, content: string): Promise<any>;
}
