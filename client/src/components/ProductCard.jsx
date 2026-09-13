import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const targetId = product._id || product.productId;
  const variants = product.variants || [];
  const minPrice = variants.length > 0 
    ? Math.min(...variants.map((v) => v.price)) 
    : 0;
  const maxPrice = variants.length > 0 
    ? Math.max(...variants.map((v) => v.price)) 
    : 0;

  const priceText = minPrice === maxPrice 
    ? `฿${minPrice.toLocaleString()}` 
    : `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;

  // Unique colors
  const colors = [...new Set(variants.map((v) => v.color))];

  return (
    <Link
      to={`/products/${targetId}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-primary text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-white/5 p-2 sm:p-3">
        <div className="h-full w-full overflow-hidden rounded-xl bg-surface">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {product.category && (
          <span className="absolute top-4 left-4 rounded-lg bg-primary/90 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Info (Matching deep blue card with white text) */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase">
            {product.gender || "Unisex"}
          </span>
          {colors.length > 0 && (
            <span className="text-[10px] sm:text-xs text-white/70">
              {colors.length} {colors.length > 1 ? "colors" : "color"}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-sm sm:text-base font-bold text-white transition-colors group-hover:text-amber-200 line-clamp-1">
          {product.name}
        </h3>

        <p className="mb-2 text-[11px] sm:text-xs text-white/70 line-clamp-1">
          {product.description}
        </p>

        {/* Color preview tags */}
        {colors.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {colors.slice(0, 2).map((col) => (
              <span
                key={col}
                className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white"
              >
                {col}
              </span>
            ))}
            {colors.length > 2 && (
              <span className="text-[10px] text-white/70 self-center">
                +{colors.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-2">
          <span className="text-xs sm:text-sm font-extrabold text-white">
            {priceText}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-white/90 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-transform">
            ดูสินค้า →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { ProductCard };