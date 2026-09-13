import React from "react";

export const ProductGallery = ({
  displayedImage,
  productName,
  thumbnails = [],
  activeThumbIndex = 0,
  onSelectThumbnail,
}) => {
  return (
    <div className="lg:col-span-7 w-full rounded-2xl sm:rounded-3xl bg-accent p-3.5 sm:p-5 shadow-lg flex flex-col justify-between">
      {/* Main Image View - Seamless background matching the photo */}
      <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#ededed] flex items-center justify-center shadow-inner">
        <img
          src={displayedImage}
          alt={productName || "Product"}
          className="h-full w-full object-contain transition-all duration-300"
        />
      </div>

      {/* 7 Thumbnail Boxes matching the seamless background */}
      <div className="mt-3 sm:mt-4 grid grid-cols-7 gap-2 sm:gap-2.5 w-full">
        {thumbnails.map((thumb, idx) => {
          const isActive = activeThumbIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectThumbnail(thumb, idx)}
              className={`relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl bg-[#ededed] p-1 transition-all cursor-pointer ${
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
