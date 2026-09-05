import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Page title according to current category
  const pageTitle = useMemo(() => {
    if (selectedCategory === "tops") return "Product Tops";
    if (selectedCategory === "bottoms") return "Product Bottoms";
    return "Products";
  }, [selectedCategory]);

  return (
    <main className="flex-1 bg-background py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Title Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="mb-1 text-xs text-secondary">
              <ol className="flex items-center gap-2">
                <li>
                  <Link to="/" className="hover:text-primary transition">
                    หน้าแรก
                  </Link>
                </li>
                <li>/</li>
                <li className="font-semibold text-primary">{pageTitle}</li>
              </ol>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="search"
              placeholder="ค้นหาชื่อสินค้า, สไตล์..."
              value={searchKeyword}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-occasion-border/30 bg-surface px-4 py-2 text-xs sm:text-sm text-primary placeholder:text-secondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm"
            />
            {searchKeyword && (
              <button
                onClick={() => handleSearchChange({ target: { value: "" } })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-secondary whitespace-nowrap">
            {!loading && <span>พบ {products.length} รายการ</span>}
          </div>
        </div>

        {/* HERO SECTION: "แสดงสินค้าแนะนำ" (Pink outer box with two blue cards) */}
        {!loading && recommendedProducts.length > 0 && !searchKeyword && (
          <section
            aria-label="สินค้าแนะนำ"
            className="mb-12 rounded-3xl bg-accent p-4 sm:p-6 lg:p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {recommendedProducts.map((rec) => (
                <Link
                  key={rec._id || rec.productId}
                  to={`/products/${rec._id || rec.productId}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 sm:p-8 text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer min-h-[220px] sm:min-h-[260px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-lg bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        แสดงสินค้าแนะนำ
                      </span>
                      <h2 className="mt-3 text-xl sm:text-2xl font-black group-hover:text-amber-200 transition">
                        {rec.name}
                      </h2>
                      <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2 max-w-xs">
                        {rec.description}
                      </p>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-inner">
                      <img
                        src={rec.imageUrl}
                        alt={rec.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="text-lg sm:text-xl font-extrabold text-white">
                      ฿{rec.variants?.[0]?.price?.toLocaleString() || "590"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm group-hover:bg-amber-100 transition">
                      ดูรายละเอียด →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
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
        {!loading && !error && products.length > 0 && (
          <section aria-label="รายการสินค้า">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.productId}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export { ProductListPage };