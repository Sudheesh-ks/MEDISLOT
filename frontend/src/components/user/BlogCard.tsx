import React from 'react';

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
  author,
  categoryColor,
  onClick,
}) => {
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
          <span className="text-sm font-medium text-slate-300">{author}</span>
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
