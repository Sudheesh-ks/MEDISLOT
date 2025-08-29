import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/user/assets';
import { getBlogsAPI } from '../../services/blogService';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ChatBotModal from '../../components/user/ChatBotModal';

interface Article {
  _id: string;
  title: string;
  summary: string;
  publishDate: string;
  readTime: string;
  category: string;
  imageUrl: string;
  author: string;
  image: string;
}

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [visibleArticles, setVisibleArticles] = useState<number>(9);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const articlesPerPage = 6;

  const context = useContext(UserContext);
  if (!context) throw new Error('AppContext missing');
  const { token } = context;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogsAPI(token!);
        setArticles(res.data.data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    fetchBlogs();
  }, []);

  const formatPublishDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Digital Health': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Oncology: 'bg-red-500/20 text-red-400 border-red-500/30',
      MedTech: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Medical Training': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Personalized Medicine': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Mental Health': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Healthcare IT': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Bioengineering: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'Pharmaceutical AI': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      'Remote Care': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      Nanotechnology: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      Genomics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleLoadMoreArticles = (): void => {
    setVisibleArticles((prev) => {
      const newCount = prev + articlesPerPage;
      return newCount > articles.length ? articles.length : newCount;
    });
  };

  const handleArticleClick = (articleId: string): void => {
    navigate(`/blogs/${articleId}`);
  };

  const handleConsultationClick = (): void => {
    setIsChatOpen(true);
  };

  const articlesToDisplay = articles.slice(0, visibleArticles);
  const canLoadMore = visibleArticles < articles.length;

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-slate-100">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 pt-20 pb-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              HEALTHCARE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                INSIGHTS
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Stay informed with the latest breakthroughs in medical technology, healthcare
              innovation, and scientific research from leading experts in the field.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {articlesToDisplay.map((article, index) => (
              <article
                key={article._id}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => handleArticleClick(article._id)}
                style={{
                  animationDelay: `${(index % 6) * 100}ms`,
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x240.png?text=No+Image';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        article.category
                      )}`}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3 text-sm text-slate-400">
                    <span>{formatPublishDate(article.publishDate)}</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
                    {article.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">{article.author}</span>
                    <button
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-300 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArticleClick(article._id);
                      }}
                    >
                      Read Article
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Section */}
          {canLoadMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMoreArticles}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Load More Articles
              </button>
            </div>
          )}

          {!canLoadMore && articles.length > 0 && (
            <div className="text-center">
              <p className="text-slate-400 text-lg">
                You've reached the end of our healthcare insights collection.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Medical Consultation Bot */}
      <button
        onClick={handleConsultationClick}
        className="fixed bottom-8 right-8 w-32 h-32 md:w-18 md:h-18 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full shadow-2xl hover:shadow-blue-500/40 flex items-center justify-center text-2xl md:text-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-110 group z-50 border-2 border-blue-400/30"
      >
        <img src={assets.chatbot_logo} />

        <div className="absolute bottom-full right-0 mb-4 bg-slate-800/95 backdrop-blur-sm text-blue-400 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-2 transition-all duration-300 border border-blue-500/30 shadow-xl">
          Hey!, I'm Your AI Doctor. <br />
          Click here to chat with me.
          <div className="absolute top-full right-5 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-slate-800/95"></div>
        </div>

        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
      </button>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <ChatBotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default BlogPage;
