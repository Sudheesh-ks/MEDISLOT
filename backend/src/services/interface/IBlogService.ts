import { BlogDTO } from '../../dtos/blog.dto';
import { BlogTypes } from '../../types/blog';

export interface IBlogService {
  createBlog(data: Partial<BlogTypes>): Promise<BlogDTO>;
  getBlogById(id: string): Promise<BlogDTO | null>;
  getBlogsPaginated(
    page: number,
    limit: number
  ): Promise<{ blogs: BlogDTO[]; total: number; page: number; limit: number }>;
}
