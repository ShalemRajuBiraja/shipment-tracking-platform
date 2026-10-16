import { useEffect, useState } from "react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = "",
}) => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (totalPages <= 1) {
      setPages([1]);
      return;
    }

    const generatePages = () => {
      const pageNumbers = [];
      const totalVisiblePages = siblingCount * 2 + 5;

      if (totalPages <= totalVisiblePages) {
        for (let page = 1; page <= totalPages; page++) {
          pageNumbers.push(page);
        }

        return pageNumbers;
      }

      const leftSibling = Math.max(currentPage - siblingCount, 1);
      const rightSibling = Math.min(
        currentPage + siblingCount,
        totalPages
      );

      const showLeftDots = leftSibling > 2;
      const showRightDots = rightSibling < totalPages - 1;

      if (!showLeftDots && showRightDots) {
        const leftItemCount = 3 + siblingCount * 2;

        for (let page = 1; page <= leftItemCount; page++) {
          pageNumbers.push(page);
        }

        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        pageNumbers.push(1);
        pageNumbers.push("...");

        const rightItemCount = 3 + siblingCount * 2;
        const startPage = totalPages - rightItemCount + 1;

        for (let page = startPage; page <= totalPages; page++) {
          pageNumbers.push(page);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");

        for (let page = leftSibling; page <= rightSibling; page++) {
          pageNumbers.push(page);
        }

        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }

      return pageNumbers;
    };

    setPages(generatePages());
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      typeof onPageChange !== "function"
    ) {
      return;
    }

    onPageChange(page);
  };

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`dots-${index}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-500"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;