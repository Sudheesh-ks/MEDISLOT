import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface Column {
  key: string;
  header: string;
  width?: string;
  render?: (item: any, index: number) => React.ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: any) => void;
  className?: string;
  gridCols?: string;
  showHeader?: boolean;
  containerClassName?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 100 },
  }),
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  className = '',
  gridCols,
  showHeader = true,
  containerClassName = '',
}) => {
  const defaultGrid = `grid-cols-[${columns.map((c) => c.width ?? '1fr').join('_')}]`;

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const divider = 'border-white/10';

  return (
    <div
      className={`${glass} text-sm text-slate-200 max-h-[80vh] min-h-[60vh] overflow-y-auto ${containerClassName}`}
    >
      {showHeader && (
        <div
          className={`hidden sm:grid ${
            gridCols ?? defaultGrid
          } py-3 px-6 ${divider} border-b font-medium`}
        >
          {columns.map((col) => (
            <p
              key={col.key}
              className={`${col.hideOnMobile ? 'max-sm:hidden' : ''} ${col.className ?? ''}`}
            >
              {col.header}
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading…</div>
      ) : data.length ? (
        data.map((item, i) => (
          <motion.div
            key={item._id ?? i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            whileHover={{ scale: 1.015 }}
            onClick={() => onRowClick?.(item)}
            className={`flex flex-wrap justify-between max-sm:gap-2 sm:grid ${
              gridCols ?? defaultGrid
            } items-center py-3 px-6 ${divider} border-b hover:bg-white/5 transition ${
              onRowClick ? 'cursor-pointer' : ''
            } ${className}`}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={`${col.hideOnMobile ? 'max-sm:hidden' : ''} ${col.className ?? ''}`}
              >
                {col.render ? col.render(item, i) : item[col.key]}
              </div>
            ))}
          </motion.div>
        ))
      ) : (
        <div className="text-center py-10 text-slate-400">{emptyMessage}</div>
      )}
    </div>
  );
};

export default DataTable;
