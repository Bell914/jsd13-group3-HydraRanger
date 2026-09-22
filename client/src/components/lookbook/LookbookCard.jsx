<<<<<<< HEAD
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { useAuth } from "../../context/Auth/useAuth.jsx";
import { toggleFavoriteLookbook } from "../../services/lookbookService.js";
=======
import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { useLookbookStore } from "../../store/lookbookStore.js";
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0

export default function LookbookCard({ look, isInitialFavorited = false }) {
  if (!look) return null;

<<<<<<< HEAD
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(isInitialFavorited);
  const [loading, setLoading] = useState(false);
=======
  const isFavorite = useLookbookStore((state) => state.isFavorite(look.id));
  const toggleFavorite = useLookbookStore((state) => state.toggleFavorite);
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0

  const imgUrl = normalizeImageUrl(look.image);
  const itemsCount = look.items?.length || 2;

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // ป้องกันการเปลี่ยนหน้าเมื่อกดปุ่ม Bookmark
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบก่อนบันทึก Lookbook");
      navigate("/login");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const res = await toggleFavoriteLookbook(look.id || look._id);
      setIsFavorited(res.isFavorited);
    } catch (error) {
      console.error("Failed to toggle favorite lookbook:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <Link
      to={`/lookbook/${look.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-occasion-border/30 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 relative"
=======
    <article
      className="overflow-hidden rounded-2xl border border-stone-300 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md"
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
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

<<<<<<< HEAD
        {/* Set Saving Badge */}
        {look.saving > 0 && (
          <div className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-md z-10">
            ประหยัด ฿{look.saving.toLocaleString()}
          </div>
        )}

        {/* Look Number Badge */}
        <div className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider z-10">
          {look.id}
        </div>

        {/* Bookmark / Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={loading}
          aria-label="Save to Favorite Lookbooks"
          className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all z-20 ${
            isFavorited
              ? "bg-accent text-white"
              : "bg-white/80 text-gray-700 hover:bg-white hover:text-accent"
          }`}
        >
          <Bookmark size={18} fill={isFavorited ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Look Details Body */}
      <div className="flex flex-col flex-1 p-4 justify-between gap-3">
        <div>
          {/* Titles */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
              {look.nameTh || look.name}
            </h3>
            <span className="text-xs font-medium text-secondary shrink-0">
              {look.name}
=======
        {/* Set Saving Badge + Favorite Button (วางทับบนรูปภาพอย่างถูกต้อง ไม่ซ้ำซ้อน) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10 pointer-events-none">
          {look.saving > 0 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow-sm pointer-events-auto">
              ประหยัด ฿{look.saving.toLocaleString()}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(look);
            }}
            className={`rounded-full bg-white/90 p-2 text-secondary shadow-md backdrop-blur-sm transition cursor-pointer hover:scale-110 pointer-events-auto ${
              isFavorite ? "text-red-500" : "hover:text-red-500"
            }`}
            title={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
            aria-label={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
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
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
            </span>
          )}
<<<<<<< HEAD

          {/* Style Tags */}
          {look.styleTags && look.styleTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {look.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-secondary group-hover:bg-accent/10 group-hover:text-accent transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Bar */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-secondary/70">
              เซ็ต {itemsCount} ชิ้น (Tops & Bottoms)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-primary">
                ฿{(look.setPrice || 0).toLocaleString()}
              </span>
              {look.regularPrice && (
                <span className="text-xs text-secondary/50 line-through">
                  ฿{look.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <span className="text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            ดูุสลุคนี้ &rarr;
=======
          <span className="text-[11px] text-secondary ml-auto">
            (Tops & Bottoms {itemsCount} ชิ้น)
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
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