import React from "react";

export const ProductGallery = ({
  displayedImage,
  productName,
  thumbnails = [],
  activeThumbIndex = 0,
  onSelectThumbnail,
}) => {
  return (
    <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-accent p-4 sm:p-6 shadow-lg">
      {/* Main Image View */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#3b5377] flex items-center justify-center p-4">
        <img
          src={displayedImage}
          alt={productName || "Product"}
          className="h-full w-full object-contain transition-all duration-300"
        />
      </div>

      {/* 7 Thumbnail Boxes */}
      <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3">
        {thumbnails.map((thumb, idx) => {
          const isActive = activeThumbIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectThumbnail(thumb, idx)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#3b5377] p-1 transition-all cursor-pointer ${
                isActive
                  ? "ring-2 ring-white shadow-md scale-105"
                  : "opacity-80 hover:opacity-100"
              }`}
              aria-label={`ดูภาพมุมที่ ${idx + 1}`}
            >
              <img
                src={thumb}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-contain"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGallery;
