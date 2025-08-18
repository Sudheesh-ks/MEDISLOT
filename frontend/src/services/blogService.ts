import { api } from '../axios/axiosInstance';
import { BLOG_API } from '../constants/apiRoutes';

// Get all public blogs
export const getBlogsAPI = async (token: string) => {
  return api.get(BLOG_API.GET_BLOGS, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get single blog by ID
export const getBlogByIdAPI = async (id: string, token: string) => {
  return api.get(`${BLOG_API.GET_BLOGS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Get comments for a blog
export const getBlogCommentsAPI = async (id: string, token: string) => {
  return api.get(`${BLOG_API.GET_BLOGS}/${id}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Add a comment to a blog
export const addBlogCommentAPI = async (id: string, comment: string, token: string) => {
  return api.post(
    `${BLOG_API.GET_BLOGS}/${id}/comments`,
    { comment }, // must match backend payload { comment }
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
