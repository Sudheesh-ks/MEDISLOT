import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

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
    transition: { delay: i * 0.05, type: "spring", stiffness: 100 },
  }),
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = "No data found.",
  onRowClick,
  className = "",
  gridCols,
  showHeader = true,
  containerClassName = "",
}) => {
  const defaultGridCols = `grid-cols-[${columns.map(col => col.width || "1fr").join("_")}]`;

  return (
    <div className={`bg-white border rounded shadow-sm text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll ${containerClassName}`}>
      {/* Table Header */}
      {showHeader && (
        <div className={`hidden sm:grid ${gridCols || defaultGridCols} py-3 px-6 border-b bg-gray-50 font-medium text-gray-700`}>
          {columns.map((column) => (
            <p key={column.key} className={`${column.hideOnMobile ? "max-sm:hidden" : ""} ${column.className || ""}`}>
              {column.header}
            </p>
          ))}
        </div>
      )}

      {/* Table Body */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          Loading...
        </div>
      ) : data.length > 0 ? (
        data.map((item, index) => (
          <motion.div
            key={item._id || index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
            onClick={() => onRowClick?.(item)}
            className={`flex flex-wrap justify-between max-sm:gap-2 sm:grid ${gridCols || defaultGridCols} items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition ${
              onRowClick ? "cursor-pointer" : ""
            } ${className}`}
          >
            {columns.map((column) => (
              <div key={column.key} className={`${column.hideOnMobile ? "max-sm:hidden" : ""} ${column.className || ""}`}>
                {column.render ? column.render(item, index) : item[column.key]}
              </div>
            ))}
          </motion.div>
        ))
      ) : (
        <div className="text-center py-10 text-gray-500 text-sm">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default DataTable; 