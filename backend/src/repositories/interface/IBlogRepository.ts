import { BlogDocument } from '../../models/blogModel';
import { BlogTypes } from '../../types/blog';

export interface IBlogRepository {
  createBlog(data: Partial<BlogDocument>): Promise<BlogDocument>;
  getBlogById(id: string): Promise<BlogDocument | null>;
  getBlogsPaginated(
    page: number,
    limit: number
  ): Promise<{
    blogs: BlogDocument[];
    total: number;
    page: number;
    limit: number;
  }>;
  findAllPublicBlogs(): Promise<any>;
  getBlogComments(blogId: string): Promise<any>;
  addBlogComment(blogId: string, userId: string, content: string): Promise<any>;
  findBlogsByDoctorId(doctorId: string): Promise<BlogDocument[]>;
  updateBlog(id: string, data: Partial<BlogTypes>): Promise<BlogDocument>;
  deleteBlog(id: string): Promise<void>;
}
