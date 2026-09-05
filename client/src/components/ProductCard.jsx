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
      className="group flex flex-col overflow-hidden rounded-2xl border border-occasion-border/20 bg-surface shadow-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-background/50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.category && (
          <span className="absolute top-3 left-3 rounded-lg bg-surface/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-secondary shadow-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-secondary uppercase">
            {product.gender || "Unisex"}
          </span>
          {colors.length > 0 && (
            <span className="text-xs text-secondary/80">
              {colors.length} {colors.length > 1 ? "colors" : "color"}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-lg font-bold text-primary transition-colors group-hover:text-accent line-clamp-1">
          {product.name}
        </h3>

        <p className="mb-3 text-xs text-secondary line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Color preview tags */}
        {colors.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {colors.slice(0, 3).map((col) => (
              <span
                key={col}
                className="rounded-md border border-occasion-border/40 bg-background/60 px-2 py-0.5 text-[11px] font-medium text-secondary"
              >
                {col}
              </span>
            ))}
            {colors.length > 3 && (
              <span className="text-[11px] text-secondary/70 self-center">
                +{colors.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-occasion-border/10">
          <span className="text-base font-bold text-accent">
            {priceText}
          </span>
          <span className="text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
            ดูสินค้า →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { ProductCard };