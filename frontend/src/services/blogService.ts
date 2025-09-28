import { userApi } from '../axios/axiosInstance';
import { BLOG_API } from '../constants/apiRoutes';

export const getBlogsPaginatedAPI = async (page: number, limit: number) => {
  return userApi.get(BLOG_API.GET_BLOGS(page, limit), {});
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
