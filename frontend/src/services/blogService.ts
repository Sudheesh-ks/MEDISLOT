import { api } from '../axios/axiosInstance';
import { BLOG_API } from '../constants/apiRoutes';

export const getBlogsPaginatedAPI = async (token: string, page: number, limit: number) => {
  return api.get(BLOG_API.GET_BLOGS(page, limit), {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBlogByIdAPI = async (id: string, token: string) => {
  return api.get(BLOG_API.GET_BLOGS_BYID(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBlogCommentsAPI = async (id: string, token: string) => {
  return api.get(BLOG_API.BLOG_COMMENTS(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addBlogCommentAPI = async (id: string, comment: string, token: string) => {
  return api.post(
    BLOG_API.BLOG_COMMENTS(id),
    { comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
