import React, { useMemo } from "react";
import Button from "../Button/Button";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  paginationUI?: {
    className?: string;
    first?: React.ReactNode;
    last?: React.ReactNode;
    next?: React.ReactNode;
    prev?: React.ReactNode;
    notFound?: React.ReactNode;
  };
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  paginationUI,
}) => {
  const renderPageNumbers = useMemo(() => {
    if (totalPages <= 1) return null;

    const pages = [];
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 2) pages.push(<span key="start">...</span>);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={i === currentPage ? "primary" : "ghost"}
          onClick={() => onPageChange(i)}
          disabled={i === currentPage}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages - 1) pages.push(<span key="end">...</span>);

    return pages;
  }, [totalPages, currentPage, onPageChange]);

  const renderMobilePagination = () => (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        className={`${currentPage === 1 && 'hidden'}`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {paginationUI?.prev || "«"}
      </Button>

      <Button
        size="sm"
        variant={1 === currentPage ? "primary" : "ghost"}
        onClick={() => onPageChange(1)}
      >
        1
      </Button>

      {currentPage > 2 && currentPage < totalPages && <span>...</span>}

      {currentPage !== 1 && currentPage !== totalPages && (
        <Button size="sm" variant="primary" disabled>
          {currentPage}
        </Button>
      )}

      {currentPage < totalPages - 1 && currentPage > 1 && <span>...</span>}

      <Button
        size="sm"
        variant={totalPages === currentPage ? "primary" : "ghost"}
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </Button>

      <Button
        size="sm"
        className={`${currentPage >= totalPages && 'hidden'}`}
        variant="ghost"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {paginationUI?.next || "»"}
      </Button>
    </div>
  );

  return (
    <div
      className={`flex items-center justify-between gap-4 bg-gray-100 p-2 mt-2 rounded-lg ${
        paginationUI?.className || ""
      }`}
    >
      <span className="text-sm font-medium text-gray-700">
        {totalPages === 0
          ? paginationUI?.notFound || "هیچ موردی یافت نشد"
          : `صفحه ${currentPage} از ${totalPages}`}
      </span>

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
        className={`${currentPage === 1 && 'hidden'}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          {paginationUI?.first || "««"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
        className={`${currentPage === 1 && 'hidden'}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {paginationUI?.prev || "«"}
        </Button>

        <Button
          size="sm"
          variant={1 === currentPage ? "primary" : "ghost"}
          onClick={() => onPageChange(1)}
        >
          1
        </Button>

        {renderPageNumbers}

        <Button
          size="sm"
          variant={totalPages === currentPage ? "primary" : "ghost"}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>

        <Button
          size="sm"
          variant="ghost"
        className={`${currentPage >= totalPages && 'hidden'}`}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {paginationUI?.next || "»"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
        className={`${currentPage >= totalPages && 'hidden'}`}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          {paginationUI?.last || "»»"}
        </Button>
      </div>

      {/* Mobile View (remains the same) */}
      <div className="flex md:hidden">{renderMobilePagination()}</div>
    </div>
  );
};

export default Pagination;
