import { BlogDocument } from '../../models/BlogModel';
import { BlogTypes, CommentType } from '../../types/Blog';

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
  addBlogComment(blogId: string, comment: CommentType): Promise<any>;
  findBlogsByDoctorId(doctorId: string): Promise<BlogDocument[]>;
  updateBlog(id: string, data: Partial<BlogTypes>): Promise<BlogDocument | null>;
  deleteBlog(id: string): Promise<void>;
  addLike(blogId: string, userId: string): Promise<BlogDocument | null>;
  removeLike(blogId: string, userId: string): Promise<BlogDocument | null>;
  getLikes(blogId: string): Promise<BlogDocument | null>;
}
