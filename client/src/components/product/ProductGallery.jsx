import React from "react";

export const ProductGallery = ({
  displayedImage,
  productName,
  thumbnails = [],
  activeThumbIndex = 0,
  onSelectThumbnail,
}) => {
  return (
    <div className="lg:col-span-7 w-full rounded-2xl bg-[#263639] p-3 sm:p-4 shadow-lg flex flex-col justify-between">
      {/* Main Image View */}
      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-[#fbf8f3] flex items-center justify-center shadow-inner">
        <img
          src={displayedImage}
          alt={productName || "Product"}
          className="h-full w-full object-contain transition-all duration-300"
        />
      </div>

      {/* 7 Thumbnail Boxes */}
      <div className="mt-3 grid grid-cols-7 gap-2 sm:gap-2.5 w-full">
        {thumbnails.slice(0, 7).map((thumb, idx) => {
          const isActive = activeThumbIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectThumbnail(thumb, idx)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg bg-[#e7e3db] p-0.5 transition-all cursor-pointer ${
                isActive
                  ? "ring-2 sm:ring-3 ring-[#c46731] ring-offset-2 ring-offset-[#263639] shadow-lg scale-105"
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
