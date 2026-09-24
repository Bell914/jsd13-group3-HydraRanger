import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import RecommendedSlider from "../components/RecommendedSlider.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const productsSectionRef = useRef(null);

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
          setError(
            err.message
              ? `เกิดข้อผิดพลาดในการเชื่อมต่อ Product API (${err.message})`
              : "ไม่สามารถโหลดรายการสินค้าจากเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ"
          );
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


  // Never repeat products to fill the grid. Repeated cards make inventory and
  // pagination misleading, especially when the API only returns a few items.
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const getPrice = (product) => {
      const prices = (product.variants || [])
        .map((variant) => Number(variant.price))
        .filter((price) => Number.isFinite(price));
      return prices.length ? Math.min(...prices) : Number(product.price) || 0;
    };
    const sorted = [...products];
    if (sortBy === "price-low") sorted.sort((a, b) => getPrice(a) - getPrice(b));
    if (sortBy === "price-high") sorted.sort((a, b) => getPrice(b) - getPrice(a));
    if (sortBy === "name") {
      sorted.sort((a, b) => (a.name || a.title || "").localeCompare(b.name || b.title || "", "th"));
    }
    return sorted;
  }, [products, sortBy]);

  const itemsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = displayedProducts.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchKeyword, sortBy]);

  // Smooth-scroll to the product cards once search results finish loading
  useEffect(() => {
    if (!searchKeyword) return;
    if (!loading && !error && displayedProducts.length > 0) {
      productsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchKeyword, loading, error, displayedProducts.length]);

  // Land on the top of the products section when requested or category selected
  useEffect(() => {
    if (location.state?.scrollTo === "products" || (selectedCategory && selectedCategory !== "all")) {
      if (!loading && !error && displayedProducts.length > 0) {
        productsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [location.state?.scrollTo, location.state?.timestamp, selectedCategory, loading, error, displayedProducts.length]);

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    productsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        {!loading && !error && products.length > 0 && (
          <RecommendedSlider products={products} />
        )}

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
            {searchKeyword ? (
              <>
                <p className="text-lg font-semibold text-primary">
                  ไม่มีผลลัพธ์ที่ตรงกับ "{searchKeyword}"
                </p>
                <p className="mt-2 text-sm text-secondary/80">
                  ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกด
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent cursor-pointer"
                >
                  แสดงสินค้าทั้งหมด
                </Link>
              </>
            ) : (
              <p className="text-lg font-semibold text-primary">
                ไม่พบสินค้าตรงตามเงื่อนไขที่เลือก
              </p>
            )}
          </div>
        )}

        {/* Responsive product grid */}
        {!loading && !error && displayedProducts.length > 0 && (
          <section ref={productsSectionRef} id="products-section" aria-label="รายการสินค้า">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#ded8cf] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  OCCASION COLLECTION
                </p>
                <h2 className="mt-1 text-2xl font-black text-primary">
                  {searchKeyword
                    ? `ผลการค้นหา “${searchKeyword}”`
                    : selectedCategory === "tops"
                    ? "หมวดหมู่: เสื้อ (TOPS)"
                    : selectedCategory === "bottoms"
                    ? "หมวดหมู่: กางเกง (BOTTOMS)"
                    : "เลือกซื้อสินค้า"}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "tops", label: "เสื้อ (TOPS)" },
                    { id: "bottoms", label: "กางเกง (BOTTOMS)" },
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          if (cat.id === "all") {
                            newParams.delete("category");
                          } else {
                            newParams.set("category", cat.id);
                          }
                          setSearchParams(newParams);
                        }}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-accent text-white shadow-sm"
                            : "bg-surface border border-occasion-border/60 text-secondary hover:border-accent hover:text-accent"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-secondary">
                  พบ {displayedProducts.length} รายการ
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-primary">
                เรียงตาม
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-w-44 rounded-xl border border-[#d8d1c7] bg-white px-4 py-2.5 text-sm font-medium text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="featured">สินค้าแนะนำ</option>
                  <option value="price-low">ราคา: ต่ำไปสูง</option>
                  <option value="price-high">ราคา: สูงไปต่ำ</option>
                  <option value="name">ชื่อสินค้า</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.productId}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Pagination */}
        {!loading && !error && displayedProducts.length > 0 && totalPages > 1 && (
          <nav
            aria-label="การแบ่งหน้าสินค้า"
            className="my-12 flex items-center justify-center gap-3 sm:gap-6 text-base sm:text-lg font-bold"
          >
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => {
              const isActive = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageClick(pageNum)}
                  className={`transition-all duration-200 cursor-pointer px-1 py-0.5 select-none ${
                    isActive
                      ? "text-primary font-black text-xl sm:text-2xl underline decoration-accent decoration-2 underline-offset-8 scale-110"
                      : "text-secondary hover:text-accent hover:scale-110"
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