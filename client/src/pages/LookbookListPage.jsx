import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { getLookbookData } from "../services/lookbookService.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export default function LookbookListPage() {
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter state (matching FILTER dropdown in wireframe)
  const [selectedFilter, setSelectedFilter] = useState("all");

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

        {/* Wireframe Filter Dropdown: [ FILTER ˅ ] */}
        <div className="w-full">
          <label htmlFor="lookbook-filter" className="sr-only">
            กรองตามสไตล์หรือโอกาส
          </label>
          <div className="relative">
            <select
              id="lookbook-filter"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-primary shadow-xs transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">FILTER: ทุกลุค (ALL LOOKS)</option>
              {filterOptions
                .filter((opt) => opt !== "all")
                .map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.toUpperCase()}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
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
