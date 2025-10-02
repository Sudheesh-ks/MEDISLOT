import { userApi } from '../axios/axiosInstance';
import { BLOG_API } from '../constants/apiRoutes';

export const getBlogsPaginatedAPI = (
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
) => {
  let url = `/api/user/blogs?page=${page}&limit=${limit}`;
  if (sortBy) url += `&sortBy=${sortBy}`;
  if (sortOrder) url += `&sortOrder=${sortOrder}`;
  return userApi.get(url);
};

export const getBlogByIdAPI = async (id: string) => {
  return userApi.get(BLOG_API.GET_BLOGS_BYID(id), {});
};

export const getBlogCommentsAPI = async (id: string) => {
  return userApi.get(BLOG_API.BLOG_COMMENTS(id), {});
};

export const addBlogCommentAPI = async (id: string, comment: string) => {
  return userApi.post(BLOG_API.BLOG_COMMENTS(id), { comment });
};

export const likeBlogAPI = async (id: string) => {
  return userApi.post(BLOG_API.LIKE_BLOG(id));
};

export const getBlogsLikeAPI = async (id: string) => {
  return userApi.get(BLOG_API.BLOG_LIKES(id));
};
