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
  getBlogComments(blogId: string): Promise<any>;
  addBlogComment(blogId: string, userId: string, content: string): Promise<any>;
}
