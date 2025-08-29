import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import {
  addBlogCommentAPI,
  getBlogByIdAPI,
  getBlogCommentsAPI,
  getBlogsAPI,
} from '../../services/blogService';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  readTime: string;
  category: string;
  image: string;
  doctorData: {
    _id: string;
    name: string;
    email: string;
    speciality: string;
    about: string;
    image?: string;
  };
  tags?: string[];
}

interface CommentItem {
  _id: string;
  userId: string;
  userData: {
    _id: string;
    name: string;
    email: string;
  };
  text: string;
  createdAt: string;
}

const BlogDetailPage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('AppContext missing');
  const { token } = context;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [cText, setCText] = useState('');
  const [posting, setPosting] = useState(false);

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

  useEffect(() => {
    const run = async () => {
      if (!articleId || !token) return;
      setLoading(true);
      try {
        const res = await getBlogByIdAPI(articleId, token);
        const blogData: Blog = res.data.data;
        setBlog(blogData);

        try {
          const cRes = await getBlogCommentsAPI(articleId, token);
          setComments(cRes.data.data || []);
        } catch {
          setComments([]);
        }

        try {
          const allRes = await getBlogsAPI(token);
          const all: Blog[] = allRes.data.data || [];
          const rel = all
            .filter((b) => b._id !== blogData._id && b.category === blogData.category)
            .slice(0, 3);
          setRelated(rel);
        } catch {
          setRelated([]);
        }
      } catch (err) {
        console.error('Blog fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [articleId, token]);

  const handlePostComment = async () => {
    if (!articleId || !token || !cText.trim()) return;
    setPosting(true);
    try {
      const res = await addBlogCommentAPI(articleId, cText.trim(), token);
      const newComment: CommentItem = res.data.data;
      setComments((prev) => [newComment, ...prev]);
      setCText('');
    } catch (e) {
      console.error('Post comment failed', e);
    } finally {
      setPosting(false);
    }
  };

  if (loading || !blog) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading blog...</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-100">
        {/* Article Header */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/800x400.png?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                {/* Keep SAME blue pill design */}
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                  {blog.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{blog.title}</h1>
              <div className="items-center gap-4 text-slate-300">
                <span>{formatDate(blog.updatedAt)}</span> <br />
                <span>Estimated Readtime : </span>
                <span>{blog.readTime} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <img
              src={blog.doctorData.image || 'https://via.placeholder.com/100x100.png?text=Author'}
              alt={blog.doctorData.image}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{blog.doctorData.name}</h3>
              <p className="text-slate-400 text-sm mb-1">
                {blog.doctorData.speciality || 'Healthcare & Technology'}
              </p>
              <p className="text-slate-500 text-sm">{blog.doctorData.about || '—'}</p>
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-invert prose-blue max-w-none mb-12 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-t border-slate-800">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              More from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {blog.doctorData.name}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((a) => (
                <article
                  key={a._id}
                  className="group bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate(`/blogs/${a._id}`)}
                >
                  <img
                    src={a.image}
                    alt={a.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x200.png?text=No+Image';
                    }}
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3 text-sm text-slate-400">
                      <span>{formatDate(a.updatedAt)}</span>
                      <span>{a.readTime} mins</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {a.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 py-16 border-t border-slate-800">
          <h2 className="text-2xl font-bold mb-8">Comments ({comments.length})</h2>

          <div className="mb-12 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
            <textarea
              placeholder="Write your comment..."
              rows={4}
              value={cText}
              onChange={(e) => setCText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
            />
            <button
              type="button"
              onClick={handlePostComment}
              disabled={posting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>

          <div className="space-y-6">
            {comments.map((c) => (
              <div key={c._id} className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-blue-400">{c.userData.name}</h4>
                    <p className="text-slate-500 text-sm">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">{c.text}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-slate-500">No comments yet.</p>}
          </div>
        </section>
      </main>

      {/* line-clamp helper to match blog cards */}
      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default BlogDetailPage;
