import { BlogDocument } from '../../models/blogModel';

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
}
