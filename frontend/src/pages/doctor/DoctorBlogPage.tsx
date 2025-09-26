import React, { useContext, useEffect, useState } from 'react';
import { deleteDoctorBlogAPI, getDoctorBlogsAPI } from '../../services/doctorServices';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import { DoctorContext } from '../../context/DoctorContext';

interface Blog {
  id: string;
  title: string;
  summary: string;
  image?: string;
  category: string;
  createdAt: string;
  readTime?: string;
  visibility: string;
}

const DoctorBlogsPage = () => {
  const navigate = useNavigate();
  const context = useContext(DoctorContext);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);

  if (!context) throw new Error('DoctorContext missing');
  const { dToken } = context;

  useEffect(() => {
    if (!dToken) navigate('/doctor/login');
  }, [dToken]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await getDoctorBlogsAPI();
      setBlogs(data.blogs || []);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteDoctorBlogAPI(id);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-400">My Articles</h1>
          <Link
            to="/doctor/blogs/new"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white"
          >
            + New Article
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-slate-400">You haven’t published any articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col"
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-40 w-full object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-blue-300 mb-2">{blog.title}</h3>
                <p className="text-slate-400 text-sm flex-1">{blog.summary}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {blog.category} • {blog.readTime || 'N/A'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/doctor/update-blog/${blog.id}`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default DoctorBlogsPage;
