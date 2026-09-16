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
      className="relative mb-10 rounded-2xl sm:rounded-3xl bg-[#e6006e] p-4 sm:p-6 lg:p-8 shadow-lg select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
            const imgSrc = normalizeImageUrl(item.imageUrl);

            return (
              <div
                key={item._id || item.productId || idx}
                className="w-full md:w-1/2 shrink-0 p-2 sm:p-3"
              >
                <Link
                  to={`/products/${targetId}`}
                  className="group relative flex h-60 sm:h-72 md:h-80 w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#3b5377] text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer"
                >
                  {/* Background Image with subtle overlay */}
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={item.name || "สินค้าแนะนำ"}
                      className="absolute inset-0 h-full w-full object-cover opacity-30 transition-all duration-500 group-hover:scale-105 group-hover:opacity-40"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                  {/* Centered Title matching the wireframe */}
                  <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
                      แสดงสินค้าแนะนำ
                    </h2>
                    {item.name && (
                      <p className="mt-2 text-xs sm:text-sm font-semibold text-white/90 bg-[#0046a7]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm line-clamp-1 max-w-[240px] sm:max-w-xs">
                        {item.name}
                      </p>
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
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#0046a7] shadow-xl backdrop-blur transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer opacity-80 hover:opacity-100"
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
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 text-[#0046a7] shadow-xl backdrop-blur transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 cursor-pointer opacity-80 hover:opacity-100"
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
                    ? "w-7 sm:w-8 bg-white shadow-md"
                    : "w-2 sm:w-2.5 bg-white/40 hover:bg-white/70"
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
