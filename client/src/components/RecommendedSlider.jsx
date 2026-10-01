import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export default function RecommendedSlider({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);

  // Fallback items if products list is not yet loaded
  const defaultItems = useMemo(
    () => [
      {
        _id: "top-001",
        productId: "top-001",
        name: "เสื้อยืดคอตตอนทรง Relaxed",
        imageUrl: "/collection-2026/all-images/top-01-off-white.png",
      },
      {
        _id: "bottom-001",
        productId: "bottom-001",
        name: "กางเกงยีนส์ทรงตรง Relaxed",
        imageUrl: "/collection-2026/all-images/bottom-01-indigo.png",
      },
      {
        _id: "top-002",
        productId: "top-002",
        name: "เสื้อเชิ้ตลินิน Oversized",
        imageUrl: "/collection-2026/all-images/top-02-white.png",
      },
      {
        _id: "bottom-002",
        productId: "bottom-002",
        name: "กางเกง Easy Pleated ขากว้าง",
        imageUrl: "/collection-2026/all-images/bottom-02-taupe.png",
      },
      {
        _id: "top-003",
        productId: "top-003",
        name: "เสื้อโปโลผ้าถัก Compact Knit",
        imageUrl: "/collection-2026/all-images/top-03-forest.png",
      },
      {
        _id: "bottom-003",
        productId: "bottom-003",
        name: "กางเกง Utility Cargo ทรง Tapered",
        imageUrl: "/collection-2026/all-images/bottom-03-olive.png",
      },
    ],
    []
  );

  const items = useMemo(() => {
    if (products && products.length >= 2) {
      return products.slice(0, 8);
    }
    return defaultItems;
  }, [products, defaultItems]);

  // Responsive items per page (1 on mobile, 2 on desktop/tablet)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(2);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, items.length - itemsPerPage);

  // Auto slide effect
  useEffect(() => {
    if (isHovered || items.length <= itemsPerPage) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, maxIndex, items.length, itemsPerPage]);

  // Make sure currentIndex stays within bounds when itemsPerPage changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const percentPerItem = 100 / itemsPerPage;

  return (
    <section
      aria-label="สินค้าแนะนำ"
      className="relative mb-10 rounded-2xl border border-[#ded8cf] bg-[#f1eee8] p-4 shadow-sm select-none sm:rounded-3xl sm:p-6 lg:p-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-3 px-2 sm:mb-5 sm:px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          CURATED FOR YOU
        </p>
        <h2 className="mt-1 text-xl font-black text-primary sm:text-2xl">
          สินค้าแนะนำ
        </h2>
      </div>

      {/* Slider Viewport */}
      <div className="overflow-hidden rounded-xl sm:rounded-2xl">
        <div
          className="flex transition-transform duration-600 ease-out"
          style={{
            transform: `translateX(-${currentIndex * percentPerItem}%)`,
          }}
        >
          {items.map((item, idx) => {
            const targetId = item._id || item.productId;
            const rawImg =
              item.images?.[0]?.image_url ||
              item.imageUrl ||
              item.image ||
              item.variants?.[0]?.imageUrl ||
              "";
            const imgSrc = normalizeImageUrl(rawImg);
            const title = item.title || item.name || "สินค้าแนะนำ";

            return (
              <div
                key={item._id || item.productId || idx}
                className="w-full md:w-1/2 shrink-0 p-2 sm:p-3"
              >
                <Link
                  to={`/products/${targetId}`}
                  className="group relative flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-[#e4ddd3] bg-[#fbf8f3] text-primary shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer sm:h-72 sm:rounded-2xl md:h-80"
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.name || "สินค้าแนะนำ"}
                      className="absolute inset-0 h-full w-full object-contain px-8 pb-16 pt-5 transition-transform duration-500 group-hover:scale-105 sm:px-12 sm:pb-20"
                    />
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#263639] via-[#263639]/90 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 text-left sm:px-6 sm:pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#efc3bc]">
                      OCCASION PICK
                    </p>
                    {title && (
                      <h3 className="mt-1 line-clamp-1 text-base font-extrabold text-white sm:text-lg">
                        {title}
                      </h3>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev Navigation Button */}
      {items.length > itemsPerPage && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-[58%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#ded8cf] bg-white/95 text-primary shadow-md backdrop-blur transition-all duration-200 hover:bg-accent hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="สไลด์ก่อนหน้า"
        >
          <ChevronLeft size={22} className="sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Next Navigation Button */}
      {items.length > itemsPerPage && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-[58%] -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#ded8cf] bg-white/95 text-primary shadow-md backdrop-blur transition-all duration-200 hover:bg-accent hover:text-white hover:scale-110 active:scale-95 cursor-pointer"
          aria-label="สไลด์ถัดไป"
        >
          <ChevronRight size={22} className="sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Pagination Dots */}
      {items.length > itemsPerPage && (
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-7 sm:w-8 bg-primary shadow-sm"
                    : "w-2 sm:w-2.5 bg-primary/25 hover:bg-accent/70"
                }`}
                aria-label={`ไปยังสไลด์ที่ ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
