import React from "react";
import { Link } from "react-router-dom";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export default function ProductCard({ product }) {
  const targetId = product._id || product.productId;
  const variants = product.variants || [];
  const validPrices = variants
    .map((v) => Number(v.price))
    .filter((p) => !isNaN(p) && p > 0);
  const minPrice =
    validPrices.length > 0
      ? Math.min(...validPrices)
      : (Number(product.price) || 590);

  const title = product.title || product.name || "";
  const categoryName = product.category_id?.name || product.category || "";
  const catLower = categoryName.toLowerCase();
  const categoryLabel =
    catLower.includes("top")
      ? "เสื้อ"
      : catLower.includes("bottom")
      ? "กางเกง"
      : categoryName || "เสื้อ";
  const rawImg =
    product.images?.[0]?.image_url ||
    product.imageUrl ||
    product.image ||
    product.variants?.[0]?.imageUrl ||
    "";
  const imgUrl = normalizeImageUrl(rawImg);

  return (
    <Link
      to={`/products/${targetId}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 aspect-[3/4] p-3"
    >
      {/* Product Image Box */}
      <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-white/95 p-3 flex items-center justify-center">
        <img
          src={imgUrl}
          alt={title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {categoryName && (
          <span className="absolute top-2 left-2 rounded-md bg-[#0046a7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {categoryName}
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
            {title}
          </span>
          {product.tags && product.tags.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[9px] text-white/70">
                  #{t}
                </span>
              ))}
            </div>
          )}
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