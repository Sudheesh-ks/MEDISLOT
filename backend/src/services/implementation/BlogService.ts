import { Types } from 'mongoose';
import { HttpStatus } from '../../constants/Status.constants';
import { BlogDTO } from '../../dtos/Blog.dto';
import { toBlogDTO } from '../../mappers/Blog.mapper';
import { IBlogRepository } from '../../repositories/interface/IBlogRepository';
import { IDoctorRepository } from '../../repositories/interface/IDoctorRepository';
import { IUserRepository } from '../../repositories/interface/IUserRepository';
import { BlogTypes } from '../../types/Blog';
import { IBlogService } from '../interface/IBlogService';
import { v2 as cloudinary } from 'cloudinary';

export class BlogService implements IBlogService {
  constructor(
    private readonly _blogRepository: IBlogRepository,
    private readonly _doctorRepository: IDoctorRepository,
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

    const doctor = await this._doctorRepository.findDoctorById(doctorId);
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

  async getCategories(): Promise<string[]> {
    const predefined = [
      'digital-health',
      'ai-medicine',
      'cardiology',
      'neurology',
      'oncology',
      'pediatrics',
      'surgery',
      'medical-research',
    ];

    return predefined;
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

    if (!updated) {
      throw new Error('Blog not found');
    }

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

  async getBlogsPaginated(page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc') {
    const { blogs, total } = await this._blogRepository.getBlogsPaginated(
      page,
      limit,
      sortBy,
      sortOrder
    );
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
    if (!content.trim()) {
      throw new Error('Content cannot be empty');
    }

    const user = await this._userRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const comment = {
      userId,
      userData: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      text: content,
      createdAt: new Date(),
    };

    await this._blogRepository.addBlogComment(blogId, comment);
  }

  async toggleLike(
    blogId: string,
    userId: string
  ): Promise<{ count: number; likedByUser: boolean }> {
    const blog = await this._blogRepository.getBlogById(blogId);

    if (!blog) {
      throw new Error('Blog not found');
    }

    const alreadyLiked = blog.likes.some((id: Types.ObjectId | string) => id.toString() === userId);

    let updated;

    if (alreadyLiked) {
      updated = await this._blogRepository.removeLike(blogId, userId);
    } else {
      updated = await this._blogRepository.addLike(blogId, userId);
    }

    return {
      count: updated!.likes.length,
      likedByUser: !alreadyLiked,
    };
  }

  async getBlogLikes(
    blogId: string,
    userId: string
  ): Promise<{ count: number; likedByUser: boolean }> {
    const blog = await this._blogRepository.getLikes(blogId);

    if (!blog) {
      throw new Error('Blog not found');
    }

    const likedByUser = blog.likes.some((id: Types.ObjectId | string) => id.toString() === userId);

    return {
      count: blog.likes.length,
      likedByUser,
    };
  }
}
