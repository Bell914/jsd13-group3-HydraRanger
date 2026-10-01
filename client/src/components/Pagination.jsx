import React from "react";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center">
      <div className="join shadow-sm">
        <button
          className="join-item btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          «
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`join-item btn ${currentPage === index + 1 ? "btn-active" : ""}`}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          className="join-item btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
};
