import { HttpStatus } from '../../constants/status.constants';
import { BlogDTO } from '../../dtos/blog.dto';
import { toBlogDTO } from '../../mappers/blog.mapper';
import { IBlogRepository } from '../../repositories/interface/IBlogRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { BlogTypes } from '../../types/blog';
import { IBlogService } from '../interface/IBlogService';
import { v2 as cloudinary } from 'cloudinary';

export class BlogService implements IBlogService {
  constructor(
    private readonly _blogRepository: IBlogRepository,
    private readonly _userRepository: IUserRepository
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

  async getBlogsByDoctor(doctorId: string): Promise<BlogDTO[]> {
    const blogs = await this._blogRepository.findBlogsByDoctorId(doctorId);
    return blogs.map(toBlogDTO);
  }

  async updateBlog(
    id: string,
    doctorId: string,
    data: Partial<BlogTypes>
  ): Promise<BlogDTO | null> {
    const blog = await this._blogRepository.getBlogById(id);
    if (!blog) throw new Error('Blog not found');
    if (blog.doctorId.toString() !== doctorId.toString()) {
      throw new Error('Unauthorized');
    }

    let imageUrl = blog.image;
    if (data.image && typeof data.image !== 'string') {
      const uploadResult = await cloudinary.uploader.upload(data.image.path, {
        resource_type: 'image',
      });
      imageUrl = uploadResult.secure_url;
    }

    const updated = await this._blogRepository.updateBlog(id, {
      ...data,
      image: imageUrl,
    });

    return toBlogDTO(updated);
  }

  async deleteBlog(blogId: string, doctorId: string): Promise<boolean> {
    const blog = await this._blogRepository.getBlogById(blogId);
    if (!blog) return false;
    if (blog.doctorId.toString() !== doctorId.toString()) {
      throw new Error('Unauthorized');
    }

    await this._blogRepository.deleteBlog(blogId);
    return true;
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
