import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GridProps<T> = {
  items: T[];
  itemsPerPage: number;
  renderItem: (item: T) => React.JSX.Element;
  className?: string;
};

export const PaginatedGrid = <T,>({
  items,
  itemsPerPage,
  renderItem,
  className = "",
}: GridProps<T>) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="relative">
      <div className={className}>
        {visibleItems.map((item) => renderItem(item))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-2 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={`p-1 rounded-full ${
              currentPage === 0
                ? "text-gray-400"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className={`p-1 rounded-full ${
              currentPage === totalPages - 1
                ? "text-gray-400"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

