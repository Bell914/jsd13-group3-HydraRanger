import React from "react";

export const ProductGallery = ({
  displayedImage,
  productName,
  thumbnails = [],
  activeThumbIndex = 0,
  onSelectThumbnail,
}) => {
  return (
    <div className="lg:col-span-7 w-full rounded-2xl sm:rounded-3xl bg-[#e6006e] p-4 sm:p-6 shadow-lg flex flex-col justify-between">
      {/* Main Image View - White background */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow-inner">
        <img
          src={displayedImage}
          alt={productName || "Product"}
          className="h-full w-full object-contain p-2 transition-all duration-300"
        />
      </div>

      {/* 7 Thumbnail Boxes */}
      <div className="mt-4 grid grid-cols-7 gap-2 sm:gap-3 w-full">
        {thumbnails.slice(0, 7).map((thumb, idx) => {
          const isActive = activeThumbIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectThumbnail(thumb, idx)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-white p-1 transition-all cursor-pointer ${
                isActive
                  ? "ring-2 sm:ring-3 ring-white ring-offset-2 ring-offset-[#e6006e] shadow-lg scale-105"
                  : "opacity-80 hover:opacity-100 hover:scale-102"
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
