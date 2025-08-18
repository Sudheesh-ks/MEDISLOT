import { HttpStatus } from '../../constants/status.constants';
import { BlogDTO } from '../../dtos/blog.dto';
import { toBlogDTO } from '../../mappers/blog.mapper';
import { BlogRepository } from '../../repositories/implementation/BlogRepository';
import { UserRepository } from '../../repositories/implementation/UserRepository';
import { BlogTypes } from '../../types/blog';
import { IBlogService } from '../interface/IBlogService';
import { v2 as cloudinary } from 'cloudinary';

export class BlogService implements IBlogService {
  constructor(
    private readonly _blogRepository = new BlogRepository(),
    private readonly _userRepository = new UserRepository()
  ) {}

  async createBlog(data: BlogTypes): Promise<BlogDTO> {
    const {
      title,
      summary,
      content,
      category,
      readTime,
      tags,
      visibility,
      doctorId,
      image: file,
    } = data;

    console.log(data);

    if (!title || !summary || !content || !category || !readTime || !tags || !visibility) {
      const error: any = new Error('All fields are required');
      error.statusCode = HttpStatus.BAD_REQUEST;
      throw error;
    }

    const doctor = await this._userRepository.findDoctorById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    let parsedTags: string[] = [];
    try {
      parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags as string);
    } catch {
      parsedTags = [];
    }

    let imageUrl: string | undefined;
    if (file && typeof file !== 'string') {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        resource_type: 'image',
      });
      imageUrl = uploadResult.secure_url;
    }
    const doc = await this._blogRepository.createBlog({
      title,
      summary,
      content,
      category,
      readTime,
      tags: parsedTags,
      visibility,
      doctorId,
      doctorData: doctor,
      image: imageUrl,
    });
    return toBlogDTO(doc);
  }

  async getBlogById(id: string): Promise<BlogDTO | null> {
    const doc = await this._blogRepository.getBlogById(id);
    return doc ? toBlogDTO(doc) : null;
  }

  async getBlogsPaginated(page: number, limit: number) {
    const { blogs, total } = await this._blogRepository.getBlogsPaginated(page, limit);
    return {
      blogs: blogs.map(toBlogDTO),
      total,
      page,
      limit,
    };
  }

  async getAllBlogs() {
    return this._blogRepository.findAllPublicBlogs();
  }

  async getBlogComments(blogId: string) {
    return this._blogRepository.getBlogComments(blogId);
  }

  async addBlogComment(blogId: string, userId: string, content: string) {
    return this._blogRepository.addBlogComment(blogId, userId, content);
  }
}
