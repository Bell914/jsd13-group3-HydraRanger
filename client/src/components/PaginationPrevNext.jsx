import React from "react";

export const PaginationPrevNext = ({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center justify-between pt-4 pb-12 border-t border-stone-200 mt-2"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          currentPage <= 1
            ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400"
            : "bg-white text-primary hover:bg-stone-50 hover:border-primary active:scale-98"
        }`}
      >
        &larr; PREV
      </button>

      <span className="text-sm font-extrabold text-primary tracking-widest">
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          currentPage >= totalPages
            ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400"
            : "bg-white text-primary hover:bg-stone-50 hover:border-primary active:scale-98"
        }`}
      >
        NEXT &rarr;
      </button>
    </nav>
  );
};

export default PaginationPrevNext;