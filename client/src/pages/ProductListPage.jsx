import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Default to "tops" or "all" based on query param
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

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", cat);
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const nextParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      nextParams.set("search", val);
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Recommended products: pick the first two products
  const recommendedProducts = useMemo(() => {
    if (products.length >= 2) return products.slice(0, 2);
    return products;
  }, [products]);

  // Ensure the grid looks rich and full like the design mockup (16 items across 4 columns)
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length < 16) {
      const list = [];
      while (list.length < 16) {
        list.push(...products);
      }
      return list.slice(0, 16);
    }
    return products;
  }, [products]);

  // Page title according to current category
  const pageTitle = useMemo(() => {
    if (selectedCategory === "tops") return "Product Tops";
    if (selectedCategory === "bottoms") return "Product Bottoms";
    return "Products";
  }, [selectedCategory]);

  return (
    <main className="flex-1 bg-background py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav aria-label="Breadcrumb" className="text-xs text-secondary">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-primary transition">
                  หน้าแรก
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-primary">
                {selectedCategory === "tops"
                  ? "เสื้อ (Tops)"
                  : selectedCategory === "bottoms"
                  ? "กางเกง (Bottoms)"
                  : "สินค้าทั้งหมด (Products)"}
              </li>
            </ol>
          </nav>
        </div>

        {/* HERO SECTION: Magenta/Pink outer container with TWO 'แสดงสินค้าแนะนำ' blue cards */}
        <section
          aria-label="สินค้าแนะนำ"
          className="mb-10 rounded-2xl sm:rounded-3xl bg-accent p-4 sm:p-6 lg:p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1 */}
            <Link
              to={recommendedProducts[0] ? `/products/${recommendedProducts[0]._id || recommendedProducts[0].productId}` : "/products/top-001"}
              className="group relative flex h-60 sm:h-72 md:h-80 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#3b5377] text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
                แสดงสินค้าแนะนำ
              </h2>
            </Link>

            {/* Card 2 */}
            <Link
              to={recommendedProducts[1] ? `/products/${recommendedProducts[1]._id || recommendedProducts[1].productId}` : "/products/bottom-001"}
              className="group relative flex h-60 sm:h-72 md:h-80 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#3b5377] text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
                แสดงสินค้าแนะนำ
              </h2>
            </Link>
          </div>
        </section>

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
            <p className="mt-1 text-sm text-secondary">
              ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูสิ
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {/* 4-Column Products Grid matching wireframe */}
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
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }}
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