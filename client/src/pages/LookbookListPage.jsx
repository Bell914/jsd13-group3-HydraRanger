import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { getLookbookData } from "../services/lookbookService.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { SlidersHorizontal, ChevronDown, Check, X, Sparkles } from "lucide-react";

export default function LookbookListPage() {
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter state (matching FILTER dropdown in wireframe)
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination state (matching PREV 1/2 NEXT in wireframe, 5 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLookbookData();
      if (!data || !data.looks) {
        throw new Error("ไม่พบข้อมูล Lookbook จากระบบ");
      }
      setCollectionInfo(data.collection || null);
      setLooks(data.looks || []);
    } catch (err) {
      console.error("Lookbook fetch error:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลด Lookbook");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter options from styles & occasions
  const filterOptions = useMemo(() => {
    const tags = new Set();
    looks.forEach((l) => {
      if (Array.isArray(l.styleTags)) {
        l.styleTags.forEach((t) => tags.add(t));
      }
      if (Array.isArray(l.occasion)) {
        l.occasion.forEach((o) => tags.add(o));
      }
    });
    return ["all", ...Array.from(tags)];
  }, [looks]);

  // Count items per tag for badge display
  const tagCounts = useMemo(() => {
    const counts = { all: looks.length };
    looks.forEach((l) => {
      const combined = new Set([...(l.styleTags || []), ...(l.occasion || [])]);
      combined.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [looks]);

  // Filtered looks
  const filteredLooks = useMemo(() => {
    if (selectedFilter === "all") return looks;
    return looks.filter((l) => {
      const hasTag = l.styleTags?.some(
        (t) => t.toLowerCase() === selectedFilter.toLowerCase()
      );
      const hasOccasion = l.occasion?.some(
        (o) => o.toLowerCase() === selectedFilter.toLowerCase()
      );
      return hasTag || hasOccasion;
    });
  }, [looks, selectedFilter]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  // Pagination calculations (5 looks per page)
  const totalPages = Math.max(1, Math.ceil(filteredLooks.length / ITEMS_PER_PAGE));
  const paginatedLooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLooks, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6">
      {/* Hero Section: video banner */}
      <section className="relative mb-8 overflow-hidden rounded-2xl">
        <video
          src="/collection-2026/hero-media/Model_changing_outfits_for_campaign_20260917022750.mp4"
          className="h-[40vh] w-full object-cover md:h-[50vh]"
          autoPlay
          muted
          playsInline
          loop
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/35 to-transparent p-6 md:p-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white drop-shadow-md">
              occasion mix and match style by ai
            </p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[1.05] tracking-[0.02em] text-white drop-shadow-lg md:text-6xl">
              LOOKBOOK
              <br />
              CAPSULE
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Wireframe Header: LOOKBOOK Title */}
        <header className="text-center pt-2">
          <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-wider uppercase">
            LOOKBOOK
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1.5">
            {collectionInfo?.description || "คอลเลกชัน Unisex สไตล์มินิมอลที่หยิบมาจัดลุคได้สนุก"}
          </p>
        </header>

        {/* Custom Filter Dropdown */}
        <div className="w-full relative" ref={dropdownRef}>
          {/* Custom Select Trigger */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold shadow-xs transition-all cursor-pointer ${
              isDropdownOpen
                ? "border-primary ring-2 ring-primary/20 shadow-md"
                : "border-stone-300 hover:border-primary/70"
            }`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center gap-2.5 truncate">
              <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-primary truncate">
                {selectedFilter === "all"
                  ? "ALL LOOKS"
                  : selectedFilter.toUpperCase()}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-secondary">
                {filteredLooks.length} ลุค
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedFilter !== "all" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFilter("all");
                  }}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                  title="ล้างตัวกรอง"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <ChevronDown
                className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </div>
          </button>

          {/* Custom Animated Popover Menu */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-2 z-40 overflow-hidden rounded-2xl border border-stone-200 bg-white/95 backdrop-blur-md p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
              role="listbox"
            >
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-secondary/70 border-b border-stone-100 flex items-center justify-between">
                <span>เลือกสไตล์หรือโอกาส</span>
                <span>{filterOptions.length - 1} หมวด</span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {/* Option All */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("all");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    selectedFilter === "all"
                      ? "bg-primary text-white font-bold"
                      : "text-primary hover:bg-stone-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ALL LOOKS</span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedFilter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-secondary"
                    }`}
                  >
                    {looks.length}
                  </span>
                </button>

                {/* Options List */}
                {filterOptions
                  .filter((opt) => opt !== "all")
                  .map((opt) => {
                    const isSelected = selectedFilter.toLowerCase() === opt.toLowerCase();
                    const count = tagCounts[opt] || 0;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedFilter(opt);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white font-bold"
                            : "text-primary hover:bg-stone-100"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          <span>{opt.toUpperCase()}</span>
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-stone-100 text-secondary"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner message="กำลังโหลด Lookbook..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center my-6" role="alert">
            <div className="text-3xl mb-2">⚠️</div>
            <h2 className="text-base font-bold text-red-800 mb-1">ไม่สามารถโหลดข้อมูลได้</h2>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow hover:bg-primary/90 cursor-pointer"
            >
              ลองใหม่อีกครั้ง (Retry)
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedLooks.length === 0 && (
          <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center my-8">
            <div className="text-3xl mb-2">🔍</div>
            <h2 className="text-base font-bold text-primary mb-1">ไม่พบลุคที่ตรงกับตัวกรอง</h2>
            <p className="text-xs text-secondary mb-4">ลองเลือกตัวกรองอื่นเพื่อค้นหาลุคใหม่</p>
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg"
            >
              แสดงทุกลุค
            </button>
          </div>
        )}

        {/* Wireframe Lookbook Cards Stack (5 Cards per Page) */}
        {!loading && !error && paginatedLooks.length > 0 && (
          <div className="flex flex-col gap-6">
            {paginatedLooks.map((look) => {
              const imgUrl = normalizeImageUrl(look.image);
              return (
                <article
                  key={look.id}
                  className="overflow-hidden rounded-2xl border border-stone-300 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-stone-100 mb-4">
                    <img
                      src={imgUrl}
                      alt={look.nameTh || look.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-black/65 backdrop-blur-xs px-2.5 py-1 text-[11px] font-bold text-white uppercase">
                      {look.id}
                    </span>
                    {look.saving > 0 && (
                      <span className="absolute top-3 right-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        ประหยัด ฿{look.saving.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Card Text Content (Title & Concept description) */}
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-primary line-clamp-1">
                        {look.nameTh || look.name}
                      </h2>
                      <span className="text-xs font-medium text-secondary shrink-0">
                        {look.name}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-secondary/90 line-clamp-2 leading-relaxed">
                      {look.concept}
                    </p>

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
                        (Tops & Bottoms 2 ชิ้น)
                      </span>
                    </div>
                  </div>

                  {/* Wireframe Full-Width Button [ BUTTON ] */}
                  <Link
                    to={`/lookbook/${look.id}`}
                    className="block w-full text-center py-3 px-4 rounded-xl border-2 border-primary bg-white text-primary font-bold text-sm sm:text-base hover:bg-primary hover:text-white transition-all shadow-xs"
                    id={`button-view-look-${look.id}`}
                  >
                    ดูรายละเอียดลุค (VIEW LOOK)
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* Wireframe Pagination: [ PREV ]   1/2   [ NEXT ] */}
        {!loading && !error && totalPages > 1 && (
          <nav
            aria-label="Lookbook pagination"
            className="flex items-center justify-between pt-4 pb-12 border-t border-stone-200 mt-2"
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                currentPage <= 1
                  ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400"
                  : "bg-white text-primary hover:bg-stone-50 hover:border-primary active:scale-98"
              }`}
            >
              &larr; PREV
            </button>

            <span className="text-sm font-extrabold text-primary tracking-widest">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                currentPage >= totalPages
                  ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400"
                  : "bg-white text-primary hover:bg-stone-50 hover:border-primary active:scale-98"
              }`}
            >
              NEXT &rarr;
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
