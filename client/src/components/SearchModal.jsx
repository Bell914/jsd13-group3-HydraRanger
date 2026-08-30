import React, { useEffect, useRef } from "react";

export const SearchModal = ({ query, onQueryChange, onClose, onSubmit }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      id="search-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/55 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-occasion-border/50 bg-surface p-5 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่างค้นหา"
          className="absolute right-3 top-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-xl font-bold text-secondary transition hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
        >
          ✕
        </button>
        <h3 id="search-modal-title" className="mb-4 pr-12 text-lg font-bold text-primary">
          ค้นหาสินค้า
        </h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="พิมพ์ชื่อสินค้า..."
            aria-label="คำค้นหาสินค้า"
            className="min-w-0 flex-1 rounded-xl border border-occasion-border bg-surface px-4 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:border-primary focus:outline-none focus:ring-3 focus:ring-accent/35"
          />
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 focus-visible:ring-offset-2 active:translate-y-px"
          >
            ค้นหา
          </button>
        </form>
      </div>
    </div>
  );
};
