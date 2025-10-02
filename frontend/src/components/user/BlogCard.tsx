import React, { useEffect, useState } from 'react';
import { getBlogsLikeAPI, likeBlogAPI } from '../../services/blogService';
import { Heart } from 'lucide-react';

interface BlogCardProps {
  id: string;
  title: string;
  summary: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  author: string;
  categoryColor: string;
  onClick: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  summary,
  publishDate,
  readTime,
  category,
  image,
  categoryColor,
  onClick,
}) => {
  const [likes, setLikes] = useState(0);
  const [likedByUser, setLikedByUser] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await getBlogsLikeAPI(id);
        setLikes(res.data.data.count);
        setLikedByUser(res.data.data.likedByUser);
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    };
    fetchLikes();
  }, [id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click from firing
    try {
      const res = await likeBlogAPI(id);
      setLikes(res.data.data.count);
      setLikedByUser(res.data.data.likedByUser);
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  return (
    <article
      onClick={() => onClick(id)}
      className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/400x240.png?text=No+Image';
          }}
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColor}`}>
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3 text-sm text-slate-400">
          <span>{publishDate}</span>
          <span>{readTime} mins</span>
        </div>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">{summary}</p>

        <div className="flex items-center justify-between">
          {/* Like Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-slate-300 hover:text-red-500 transition"
            >
              <Heart size={20} className={likedByUser ? 'fill-red-500 text-red-500' : ''} />
              <span>{likes}</span>
            </button>
          </div>
          <button
            className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-300 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick(id);
            }}
          >
            Read Article →
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
