import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import RecommendedSlider from "../components/RecommendedSlider.jsx";
import PaginationPrevNext from "../components/PaginationPrevNext.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
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

  const itemsPerPage = 8;
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
    setTimeout(() => {
      if (productsSectionRef.current) {
        const yOffset = -24;
        const y =
          productsSectionRef.current.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: "smooth",
        });
      }
    }, 50);
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
          <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-4">
            <span className="loading loading-spinner loading-lg text-accent"></span>
            <p className="text-sm font-medium text-secondary animate-pulse">กำลังโหลดสินค้า...</p>
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
          <section ref={productsSectionRef} id="products-section" aria-label="รายการสินค้า" className="scroll-mt-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#ded8cf] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  OCCASION COLLECTION
                </p>
                <h2 className="mt-1 text-2xl font-black text-primary">
                  {searchKeyword
                    ? `ผลการค้นหา “${searchKeyword}”`
                    : selectedCategory === "tops"
                    ? "หมวดหมู่ เสื้อ"
                    : selectedCategory === "bottoms"
                    ? "หมวดหมู่ กางเกง"
                    : "เลือกซื้อสินค้า"}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "tops", label: "เสื้อ" },
                    { id: "bottoms", label: "กางเกง" },
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

              <div className="flex items-center gap-3 text-sm font-semibold text-primary relative">
                เรียงตาม
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                    className="flex cursor-pointer items-center justify-between min-w-[180px] rounded-xl border border-[#d8d1c7] bg-white px-4 py-2.5 text-sm font-medium text-primary outline-none transition hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <span>
                      {sortBy === "featured" ? "สินค้าแนะนำ" :
                       sortBy === "price-low" ? "ราคา ต่ำไปสูง" :
                       sortBy === "price-high" ? "ราคา สูงไปต่ำ" :
                       "ชื่อสินค้า"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-primary transition-transform ${isSortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isSortOpen && (
                    <ul className="absolute right-0 top-full z-[10] mt-2 w-[180px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white rounded-xl border border-[#d8d1c7]/50 flex flex-col gap-1">
                      <li>
                        <button
                          type="button"
                          className={`font-medium w-full rounded-lg flex text-left px-4 py-2 transition-colors ${sortBy === "featured" ? "bg-accent text-white" : "text-primary hover:bg-accent/10 hover:text-accent"}`}
                          onClick={() => { setSortBy("featured"); setIsSortOpen(false); }}
                        >
                          สินค้าแนะนำ
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={`font-medium w-full rounded-lg flex text-left px-4 py-2 transition-colors ${sortBy === "price-low" ? "bg-accent text-white" : "text-primary hover:bg-accent/10 hover:text-accent"}`}
                          onClick={() => { setSortBy("price-low"); setIsSortOpen(false); }}
                        >
                          ราคา ต่ำไปสูง
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={`font-medium w-full rounded-lg flex text-left px-4 py-2 transition-colors ${sortBy === "price-high" ? "bg-accent text-white" : "text-primary hover:bg-accent/10 hover:text-accent"}`}
                          onClick={() => { setSortBy("price-high"); setIsSortOpen(false); }}
                        >
                          ราคา สูงไปต่ำ
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className={`font-medium w-full rounded-lg flex text-left px-4 py-2 transition-colors ${sortBy === "name" ? "bg-accent text-white" : "text-primary hover:bg-accent/10 hover:text-accent"}`}
                          onClick={() => { setSortBy("name"); setIsSortOpen(false); }}
                        >
                          ชื่อสินค้า
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
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

{/* Dynamic Pagination (8 cards per page, PREV/NEXT style like articles) */}
        {!loading && !error && displayedProducts.length > 0 && (
          <PaginationPrevNext
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageClick}
            ariaLabel="การแบ่งหน้าสินค้า"
          />
        )}
      </div>
    </main>
  );
}

export { ProductListPage };
