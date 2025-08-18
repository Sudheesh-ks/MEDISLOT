import BlogModel, { BlogDocument } from '../../models/blogModel';
import doctorModel from '../../models/doctorModel';
import userModel from '../../models/userModel';
import { BaseRepository } from '../BaseRepository';
import { IBlogRepository } from '../interface/IBlogRepository';

export class BlogRepository extends BaseRepository<BlogDocument> implements IBlogRepository {
  constructor() {
    super(BlogModel);
  }

  async createBlog(data: Partial<BlogDocument>): Promise<BlogDocument> {
    if (data.doctorId) {
      const doctor = await doctorModel
        .findById(data.doctorId)
        .select('name speciality email image about')
        .lean();
      if (!doctor) throw new Error('Doctor not found');

      data.doctorData = doctor;
    }
    return this.create(data);
  }

  async getBlogById(id: string): Promise<BlogDocument | null> {
    return this.model.findById(id).lean();
  }

  async getBlogsPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      this.model.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(),
    ]);

    return { blogs, total, page, limit };
  }

  async findAllPublicBlogs() {
    return BlogModel.find({ visibility: 'public' }).sort({ createdAt: -1 });
  }

  async getBlogComments(blogId: string) {
    const blog = await this.model.findById(blogId).select('comments').lean();
    return blog ? blog.comments : [];
  }

  async addBlogComment(blogId: string, userId: string, content: string) {
    const blog = await this.model.findById(blogId);
    if (!blog) return null;

    const user = await userModel.findById(userId).select('-password').lean();
    if (!user) throw new Error('User not found');

    if (!blog.comments) {
      blog.comments = [];
    }

    blog.comments.push({ userId, userData: user, text: content, createdAt: new Date() });
    await blog.save();

    return blog.comments[blog.comments.length - 1]; // return latest comment
  }
}
