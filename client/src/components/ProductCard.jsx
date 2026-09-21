import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { useWishlistStore } from "../store/wishlistStore.js";
import { useAuth } from "../context/Auth/useAuth.jsx";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const targetId = product._id || product.productId;
  const isSaved = useWishlistStore((state) =>
    state.wishlist.some((item) => String(item._id) === String(targetId))
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = Boolean(auth?.isAuthenticated);
  } catch {
    isAuthenticated = false;
  }

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    toggleWishlist(product);
  };

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
  const imgUrl = normalizeImageUrl(rawImg) || undefined;

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
        {product.isEarlyAccess ? (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-950 shadow-sm">
            <Sparkles size={11} className="text-gray-950" />
            <span>EARLY ACCESS</span>
          </span>
        ) : categoryName ? (
          <span className="absolute top-2 left-2 rounded-md bg-[#0046a7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {categoryName}
          </span>
        ) : null}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all shadow-sm cursor-pointer ${
            isSaved
              ? "bg-white text-red-500 hover:bg-red-50 shadow-md scale-105"
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500"
          }`}
          title={isSaved ? "ลบออกจากรายการโปรด" : "บันทึกในรายการโปรด"}
          aria-label={isSaved ? "ลบออกจากรายการโปรด" : "บันทึกในรายการโปรด"}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
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