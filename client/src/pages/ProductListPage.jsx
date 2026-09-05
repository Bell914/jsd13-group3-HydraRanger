import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../services/productService.js";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const categories = [
    { id: "all", label: "ทั้งหมด (All)" },
    { id: "tops", label: "เสื้อ (Tops)" },
    { id: "bottoms", label: "กางเกง (Bottoms)" },
  ];

  return (
    <main className="flex-1 bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-secondary">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-primary transition">
                หน้าแรก
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-primary">สินค้าทั้งหมด</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-occasion-border/20 pb-6">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-1">
              Collection 2026 — Everyday Play
            </span>
            <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">
              สินค้าทั้งหมด
            </h1>
            <p className="mt-2 text-sm text-secondary max-w-xl">
              เสื้อผ้า Unisex สไตล์มินิมอลที่หยิบมาจัดลุคได้สนุก ใส่สบายได้ทุกวัน พร้อมไซส์และสีสันที่หลากหลาย
            </p>
          </div>

          <div className="text-sm font-medium text-secondary">
            {!loading && <span>พบ {products.length} รายการ</span>}
          </div>
        </div>

        {/* Controls: Search & Category Filter */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "border border-occasion-border/30 bg-surface text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <input
              type="search"
              placeholder="ค้นหาชื่อสินค้า, สไตล์..."
              value={searchKeyword}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-occasion-border/30 bg-surface px-4 py-2 text-sm text-primary placeholder:text-secondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            {searchKeyword && (
              <button
                onClick={() => handleSearchChange({ target: { value: "" } })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-primary"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col rounded-2xl border border-occasion-border/20 bg-surface p-4 shadow-surface animate-pulse"
              >
                <div className="aspect-square w-full rounded-xl bg-occasion-border/20 mb-4"></div>
                <div className="h-4 w-3/4 bg-occasion-border/20 rounded mb-2"></div>
                <div className="h-3 w-full bg-occasion-border/10 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-occasion-border/20 rounded mt-auto"></div>
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
              className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
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
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.productId}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export { ProductListPage };