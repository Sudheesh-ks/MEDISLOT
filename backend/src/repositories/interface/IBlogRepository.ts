import { BlogDocument } from '../../models/blogModel';
import { BlogTypes, CommentType } from '../../types/blog';

export interface IBlogRepository {
  createBlog(data: Partial<BlogDocument>): Promise<BlogDocument>;
  getBlogById(id: string): Promise<BlogDocument | null>;
  getBlogsPaginated(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<{
    blogs: BlogDocument[];
    total: number;
    page: number;
    limit: number;
  }>;
  findAllPublicBlogs(): Promise<BlogDocument[]>;
  getBlogComments(blogId: string): Promise<CommentType[] | undefined>;
  addBlogComment(blogId: string, userId: string, content: string): Promise<any>;
  findBlogsByDoctorId(doctorId: string): Promise<BlogDocument[]>;
  updateBlog(id: string, data: Partial<BlogTypes>): Promise<BlogDocument>;
  deleteBlog(id: string): Promise<void>;
  toggleLike(blogId: string, userId: string): Promise<{ count: number; likedByUser: boolean }>;
  getLikes(blogId: string, userId: string): Promise<{ count: number; likedByUser: boolean }>;
}
