import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { useAuth } from "../../context/Auth/useAuth.jsx";
import { toggleFavoriteLookbook } from "../../services/lookbookService.js";

export default function LookbookCard({ look, isInitialFavorited = false }) {
  if (!look) return null;

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(isInitialFavorited);
  const [loading, setLoading] = useState(false);

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
    <Link
      to={`/lookbook/${look.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-occasion-border/30 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 relative"
      id={`lookbook-card-${look.id}`}
    >
      {/* Look Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
        <img
          src={imgUrl}
          alt={look.nameTh || look.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

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
            </span>
          </div>

          {/* Concept Description */}
          {look.concept && (
            <p className="mt-1.5 text-xs text-secondary/80 line-clamp-2 leading-relaxed">
              {look.concept}
            </p>
          )}

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
          </span>
        </div>
      </div>
    </Link>
  );
}