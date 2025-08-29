import { api } from '../axios/axiosInstance';
import { BLOG_API } from '../constants/apiRoutes';

export const getBlogsAPI = async (token: string) => {
  return api.get(BLOG_API.GET_BLOGS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBlogByIdAPI = async (id: string, token: string) => {
  return api.get(`${BLOG_API.GET_BLOGS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getBlogCommentsAPI = async (id: string, token: string) => {
  return api.get(`${BLOG_API.GET_BLOGS}/${id}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addBlogCommentAPI = async (id: string, comment: string, token: string) => {
  return api.post(
    `${BLOG_API.GET_BLOGS}/${id}/comments`,
    { comment },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
