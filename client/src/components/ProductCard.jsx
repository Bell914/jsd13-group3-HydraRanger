import React from "react";
import { Link } from "react-router-dom";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export default function ProductCard({ product }) {
  const targetId = product._id || product.productId;
  const variants = product.variants || [];
  const minPrice = variants.length > 0 
    ? Math.min(...variants.map((v) => v.price)) 
    : 590;

  const categoryLabel = product.category === "tops" ? "เสื้อ" : "กางเกง";
  const imgUrl = normalizeImageUrl(product.imageUrl);

  return (
    <Link
      to={`/products/${targetId}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 aspect-[3/4] p-3"
    >
      {/* Product Image Box */}
      <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-white/95 p-3 flex items-center justify-center">
        <img
          src={imgUrl}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.category && (
          <span className="absolute top-2 left-2 rounded-md bg-[#0046a7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Bottom Info Bar matching wireframe */}
      <div className="pt-3 pb-1 flex items-center justify-between text-white">
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-extrabold tracking-wide text-white drop-shadow-sm">
            {categoryLabel}
          </span>
          <span className="text-[11px] text-white/80 line-clamp-1 max-w-[130px]">
            {product.name}
          </span>
        </div>

        <div className="text-right">
          <span className="text-sm sm:text-base font-black text-amber-200">
            ฿{minPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export { ProductCard };