import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ChatBotModal from '../../components/user/ChatBotModal';
import { formatPublishDate, getCategoryColor } from '../../utils/blogUtils';
import BlogCard from '../../components/user/BlogCard';
import ChatbotButton from '../../components/user/ChatbotButton';
import Pagination from '../../components/common/Pagination';
import { getBlogsPaginatedAPI } from '../../services/blogService';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const limit = 2;
  const context = useContext(UserContext);
  if (!context) throw new Error('AppContext missing');
  const { token } = context;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogsPaginatedAPI(token!, currentPage, limit);
        setArticles(res.data.data.blogs);
        setTotalPages(Math.ceil(res.data.data.total / limit));
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    fetchBlogs();
  }, [token, currentPage]);

  const handleArticleClick = (id: string) => navigate(`/blogs/${id}`);

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-100">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 pt-20 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            HEALTHCARE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
              INSIGHTS
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest breakthroughs in medical technology, healthcare
            innovation, and scientific research from leading experts.
          </p>
        </section>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {articles.map((article) => (
              <BlogCard
                key={article.id}
                id={article.id}
                title={article.title}
                summary={article.summary}
                publishDate={formatPublishDate(article.publishDate)}
                readTime={article.readTime}
                category={article.category}
                image={article.image}
                author={article.author}
                categoryColor={getCategoryColor(article.category)}
                onClick={handleArticleClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </main>

      {/* Floating Chatbot */}
      <ChatbotButton onClick={() => setIsChatOpen(true)} />
      <ChatBotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default BlogPage;
