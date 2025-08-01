import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('…');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('…');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg text-sm ring-1 ring-white/10 disabled:opacity-40 hover:bg-white/5"
      >
        Prev
      </button>

      {getPages().map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`px-3 py-1 rounded-lg text-sm ring-1 ring-white/10 hover:bg-white/5 ${p === currentPage ? 'bg-cyan-500/20' : ''}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-lg text-sm ring-1 ring-white/10 disabled:opacity-40 hover:bg-white/5"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
