import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { useLookbookStore } from "../../store/lookbookStore.js";
import { useAuth } from "../../context/Auth/useAuth.jsx";

export default function LookbookCard({ look, isInitialFavorited = false }) {
  if (!look) return null;

  const isFavorite = useLookbookStore((state) => state.isFavorite(look.id));
  const toggleFavorite = useLookbookStore((state) => state.toggleFavorite);

  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = Boolean(auth?.isAuthenticated);
  } catch {
    isAuthenticated = false;
  }

  const imgUrl = normalizeImageUrl(look.image);
  const itemsCount = look.items?.length || 2;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-stone-300 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md"
      id={`lookbook-card-${look.id}`}
    >
      {/* Card Image with Badges & Favorite Button */}
      <div className="relative mb-4">
        <Link
          to={`/lookbook/${look.id}`}
          className="block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 group cursor-pointer"
          aria-label={`ดูลุค ${look.nameTh || look.name}`}
        >
          <img
            src={imgUrl}
            alt={look.nameTh || look.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute top-3 left-3 rounded-md bg-black/65 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white uppercase">
            {look.id}
          </span>
        </Link>

        {/* Set Saving Badge + Favorite Button (วางทับบนรูปภาพอย่างถูกต้อง ไม่ซ้ำซ้อน) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10 pointer-events-none">
          {look.saving > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow-sm pointer-events-auto">
              ประหยัด ฿{look.saving.toLocaleString()}
            </span>
          )}

          {isAuthenticated && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(look);
                }}
                className={`rounded-full p-2 text-red-500 shadow-md backdrop-blur-sm transition cursor-pointer hover:scale-110 pointer-events-auto ${
                  isFavorite ? "bg-red-50" : "bg-white/90 hover:bg-red-50"
                }`}
                title={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
                aria-label={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
              >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            )}
        </div>
      </div>

      {/* Card Text Content (Title & Concept description) */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            to={`/lookbook/${look.id}`}
            className="text-lg sm:text-xl font-bold text-primary hover:text-accent transition-colors line-clamp-1"
          >
            {look.nameTh || look.name}
          </Link>
          <span className="text-xs font-medium text-secondary shrink-0">
            {look.name}
          </span>
        </div>

        {look.concept && (
          <p className="text-xs sm:text-sm text-secondary/90 line-clamp-2 leading-relaxed">
            {look.concept}
          </p>
        )}

        {/* Style Tags */}
        {look.styleTags && look.styleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {look.styleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-secondary hover:bg-stone-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Price and set info */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm sm:text-base font-extrabold text-primary">
            เซ็ต ฿{(look.setPrice || 0).toLocaleString()}
          </span>
          {look.regularPrice && (
            <span className="text-xs text-secondary/60 line-through">
              ฿{look.regularPrice.toLocaleString()}
            </span>
          )}
          <span className="text-[11px] text-secondary ml-auto">
            (Tops & Bottoms {itemsCount} ชิ้น)
          </span>
        </div>
      </div>

      {/* Wireframe Full-Width Button */}
      <Link
        to={`/lookbook/${look.id}`}
        className="block w-full text-center py-3 px-4 rounded-xl border-2 border-primary bg-white text-primary font-bold text-sm sm:text-base hover:bg-primary hover:text-white transition-all shadow-xs"
        id={`button-view-look-${look.id}`}
      >
        ดูรายละเอียดลุค (VIEW LOOK)
      </Link>
    </article>
  );
}

