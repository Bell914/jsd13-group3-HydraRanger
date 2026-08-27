import React from "react";

export const SearchBar = ({
  handleSearchSubmit,
  setSearchOpen,
  setSearchQuery,
  searchQuery,
}) => {
  return (
    <div
      id="search-modal"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => setSearchOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer border-none bg-transparent"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-gray-800 mb-4">ค้นหาสินค้า</h3>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์ชื่อสินค้า..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none text-sm"
            autoFocus
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition cursor-pointer border-none"
          >
            ค้นหา
          </button>
        </form>
      </div>
    </div>
  );
};
