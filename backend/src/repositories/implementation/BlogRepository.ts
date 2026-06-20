import BlogModel, { BlogDocument } from '../../models/BlogModel';
import { BlogTypes, CommentType } from '../../types/Blog';
import { BaseRepository } from '../BaseRepository';
import { IBlogRepository } from '../interface/IBlogRepository';

export class BlogRepository extends BaseRepository<BlogDocument> implements IBlogRepository {
  constructor() {
    super(BlogModel);
  }

  async createBlog(data: Partial<BlogDocument>): Promise<BlogDocument> {
    return this.create(data);
  }

  async getBlogById(id: string): Promise<BlogDocument | null> {
    return this.model.findById(id).lean();
  }

  async deleteBlog(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async getBlogsPaginated(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<{
    blogs: BlogDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    if (sortBy === 'likes') {
      const blogs = await this.model.aggregate([
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { likesCount: sortOrder === 'asc' ? 1 : -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      const total = await this.model.countDocuments();
      return { blogs, total, page, limit };
    }

    const [blogs, total] = await Promise.all([
      this.model
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .exec(),
      this.model.countDocuments(),
    ]);

    return { blogs, total, page, limit };
  }

  async findAllPublicBlogs(): Promise<BlogDocument[]> {
    return BlogModel.find({ visibility: 'public' }).sort({ createdAt: -1 });
  }

  async getBlogComments(blogId: string): Promise<CommentType[] | undefined> {
    const blog = await this.model.findById(blogId).select('comments').sort({ createdAt: 1 }).lean();
    return blog?.comments?.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async addBlogComment(blogId: string, comment: CommentType): Promise<any> {
    return this.model.findByIdAndUpdate(
      blogId,
      {
        $push: {
          comments: comment,
        },
      },
      { new: true }
    );
  }

  async findBlogsByDoctorId(doctorId: string): Promise<BlogDocument[]> {
    return this.model.find({ doctorId }).sort({ createdAt: -1 });
  }

  async updateBlog(id: string, data: Partial<BlogTypes>): Promise<BlogDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  // async toggleLike(
  //   blogId: string,
  //   userId: string
  // ): Promise<{ count: number; likedByUser: boolean }> {
  //   // const blog = await this.model.findById(blogId);
  //   // if (!blog) throw new Error('Blog not found');

  //   const alreadyLiked = blog.likes.some(
  //     (id: Types.ObjectId | string) => id.toString() === userId.toString()
  //   );

  //   if (alreadyLiked) {
  //     blog.likes = blog.likes.filter(
  //       (id: Types.ObjectId | string) => id.toString() !== userId.toString()
  //     );
  //   } else {
  //     blog.likes.push(userId);
  //   }

  //   await blog.save();

  //   return {
  //     count: blog.likes!.length,
  //     likedByUser: !alreadyLiked,
  //   };
  // }

  async addLike(blogId: string, userId: string): Promise<BlogDocument | null> {
    return this.model.findByIdAndUpdate(blogId, { $addToSet: { likes: userId } }, { new: true });
  }

  async removeLike(blogId: string, userId: string): Promise<BlogDocument | null> {
    return this.model.findByIdAndUpdate(blogId, { $pull: { likes: userId } }, { new: true });
  }

  async getLikes(blogId: string): Promise<BlogDocument | null> {
    return this.model.findById(blogId).select('likes');
  }
}
