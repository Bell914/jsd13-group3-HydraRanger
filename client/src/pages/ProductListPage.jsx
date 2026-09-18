import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import RecommendedSlider from "../components/RecommendedSlider.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // URL query params
  const selectedCategory = searchParams.get("category") || "all";
  const searchKeyword = searchParams.get("search") || "";

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const data = await getProducts({
          category: selectedCategory,
          search: searchKeyword,
        });
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("ไม่สามารถโหลดรายการสินค้าจากเซิร์ฟเวอร์ได้");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchKeyword]);


  // Display products: do not duplicate when user is searching or filtering by category
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const isFiltered = Boolean(searchKeyword || (selectedCategory && selectedCategory !== "all"));
    if (isFiltered) {
      return products;
    }
    if (products.length < 32) {
      const list = [];
      while (list.length < 32) {
        list.push(...products);
      }
      return list.slice(0, 32);
    }
    return products.slice(0, 32);
  }, [products, searchKeyword, selectedCategory]);

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <main className="flex-1 bg-background py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HERO SECTION: video banner on top of products */}
        <section className="relative mb-8 overflow-hidden rounded-2xl">
          <video
            src="/collection-2026/hero-media/Friends_walking_in_urban_setting_20260916215654.mp4"
            className="h-[45vh] w-full object-cover md:h-[55vh]"
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
                EXPLORE THE
                <br />
                COLLECTION
              </h1>
            </div>
          </div>
        </section>

        {/* HERO SECTION: Auto-sliding Recommended Products Carousel */}
        <RecommendedSlider products={products} />

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-2xl bg-primary/20 p-4 animate-pulse min-h-[280px]"
              >
                <div className="aspect-square w-full rounded-xl bg-primary/30 mb-4"></div>
                <div className="h-4 w-3/4 bg-primary/30 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-primary/20 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 cursor-pointer"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-occasion-border/40 bg-surface/50 py-16 px-6 text-center">
            <p className="text-lg font-semibold text-primary">
              ไม่พบสินค้าตรงตามเงื่อนไขที่เลือก
            </p>
          </div>
        )}

        {/* 4-Column Products Grid (32 items matching wireframe) */}
        {!loading && !error && displayedProducts.length > 0 && (
          <section aria-label="รายการสินค้า">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product, idx) => (
                <ProductCard
                  key={`${product._id || product.productId}-${idx}`}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pagination Numbers 1-10 matching user screenshot */}
        {!loading && !error && displayedProducts.length > 0 && (
          <nav
            aria-label="การแบ่งหน้าสินค้า"
            className="my-12 flex items-center justify-center gap-3 sm:gap-6 text-base sm:text-lg font-bold"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageClick(pageNum)}
                  className={`transition-all duration-200 cursor-pointer px-1 py-0.5 select-none ${
                    isActive
                      ? "text-[#0046a7] font-black text-xl sm:text-2xl underline decoration-accent decoration-2 underline-offset-8 scale-110"
                      : "text-[#3b82f6] hover:text-[#0046a7] hover:scale-110"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`หน้า ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </main>
  );
}

export { ProductListPage };