import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { getLookbookById, getProductDetailUrl } from "../services/lookbookService.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { useLookbookStore } from "../store/lookbookStore.js";
import { useAuth } from "../context/Auth/useAuth.jsx";

export default function LookbookDetailPage() {
  const { lookId } = useParams();

  const [look, setLook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFavorite = useLookbookStore((state) => state.isFavorite(lookId));
  const toggleFavorite = useLookbookStore((state) => state.toggleFavorite);

  let isAuthenticated = false;
  try {
    const auth = useAuth();
    isAuthenticated = Boolean(auth?.isAuthenticated);
  } catch {
    isAuthenticated = false;
  }

  const loadLook = async () => {
    setLoading(true);
    setError("");
    try {
      const currentLook = await getLookbookById(lookId);
      if (!currentLook) {
        setError("ไม่พบข้อมูล Lookbook ที่คุณต้องการ");
      } else {
        setLook(currentLook);
      }
    } catch (err) {
      console.error("Error loading lookbook detail:", err);
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดรายละเอียด Lookbook");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLook();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lookId]);

  // Standard sizes matching backend & wireframe
  const standardSizes = ["S", "M", "L"];

  // Items from look data
  const items = look?.items || [];

  return (
    <main className="min-h-screen bg-background pb-28 pt-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        {/* Wireframe Top Bar: < DETAIL */}
        <div className="flex items-center justify-between py-2 border-b border-stone-200">
          <Link
            to="/lookbook"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-extrabold text-primary hover:text-accent transition-colors"
            id="back-to-lookbook-link"
          >
            <span className="text-lg font-black">&larr;</span> DETAIL
          </Link>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            {look?.id}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex justify-center items-center">
            <LoadingSpinner message="กำลังโหลดรายละเอียด Lookbook..." size="lg" />
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div
            className="my-12 p-8 rounded-2xl bg-white border border-red-200 text-center shadow-xs"
            role="alert"
          >
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-base font-bold text-primary mb-1">
              ไม่พบลุคที่ต้องการ ({lookId})
            </h2>
            <p className="text-xs text-secondary mb-5">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={loadLook}
                className="px-4 py-2 bg-stone-100 text-primary font-bold text-xs rounded-lg hover:bg-stone-200"
              >
                ลองใหม่ (Retry)
              </button>
              <Link
                to="/lookbook"
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/90"
              >
                กลับไปหน้ารวม Lookbook
              </Link>
            </div>
          </div>
        )}

        {/* Wireframe Detail Content */}
        {!loading && !error && look && (
          <div className="flex flex-col gap-6">
            {/* Wireframe Big Hero Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden rounded-2xl border border-stone-300 bg-stone-100 shadow-xs">
              <img
                src={normalizeImageUrl(look.image)}
                alt={look.nameTh || look.name}
                className="h-full w-full object-cover"
              />
              {look.saving > 0 && (
                <div className="absolute top-3 right-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-md">
                  ประหยัด ฿{look.saving.toLocaleString()}
                </div>
              )}
            </div>

            {/* Wireframe Title & Description Lines */}
            <div className="flex flex-col gap-2 border-b border-stone-200 pb-5">
              <div className="flex items-baseline justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-primary">
                  {look.nameTh}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary">
                    {look.name}
                  </span>
                  {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(look)}
                    className={`rounded-full p-2 transition cursor-pointer hover:scale-110 ${
                      isFavorite ? "text-red-500 bg-red-50" : "text-red-500 hover:bg-red-50"
                    }`}
                    title={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
                    aria-label={isFavorite ? "ลบออกจากลุคโปรด" : "บันทึกเป็นลุคโปรด"}
                  >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-secondary/90 leading-relaxed">
                {look.concept}
              </p>

              {/* Tags line */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {look.styleTags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Wireframe Item Cards Stack (Tops and Bottoms) */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-primary uppercase tracking-wider">
                สินค้าในลุคนี้
              </h2>

              {items.map((item, idx) => {
                const isTop =
                  item.sku?.toUpperCase().startsWith("TOP") || idx === 0;
                const categoryLabel = isTop ? "TOPS (เสื้อ)" : "BOTTOMS (กางเกง)";
                const targetUrl = getProductDetailUrl(item.productId);
                const itemSizes = item.sizes || standardSizes;

                return (
                  <Link
                    key={item.sku || idx}
                    to={targetUrl}
                    className="group flex gap-4 p-4 rounded-2xl border border-stone-300 bg-white shadow-xs hover:border-primary hover:shadow-md transition-all cursor-pointer items-center"
                    id={`lookbook-item-card-${item.sku || idx}`}
                  >
                    {/* Wireframe Square Product Thumbnail on Left */}
                    <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center">
                      <img
                        src={normalizeImageUrl(item.image)}
                        alt={item.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Wireframe Details on Right (Title, Price, Sizes) */}
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider">
                        {categoryLabel}
                      </span>

                      <h3 className="text-sm sm:text-base font-bold text-primary line-clamp-1 group-hover:text-accent transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-secondary mt-0.5">
                        สี: <span className="font-semibold text-primary">{item.color}</span>
                      </p>

                      <span className="text-sm sm:text-base font-black text-primary mt-1">
                        ฿{item.price?.toLocaleString()}
                      </span>

                      {/* Wireframe Size Boxes [ S ] [ M ] [ L ] */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {standardSizes.map((sz) => {
                          const isAvailable = itemSizes.includes(sz);
                          return (
                            <span
                              key={sz}
                              className={`h-6 w-6 flex items-center justify-center rounded border text-[10px] font-bold ${
                                isAvailable
                                  ? "border-stone-400 bg-stone-50 text-primary"
                                  : "border-stone-200 bg-stone-100 text-stone-300 line-through"
                              }`}
                            >
                              {sz}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Wireframe Fixed Bottom Bar: [ Price / Info ] [ BUTTON / VIEW PRODUCTS ] */}
      {!loading && !error && look && (
        <aside
          aria-label="Lookbook set summary"
          className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3 px-4 shadow-lg z-40"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-secondary font-medium">
                ราคาเซ็ตพิเศษ (SET PRICE)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-primary">
                  ฿{(look.setPrice || 0).toLocaleString()}
                </span>
                {look.regularPrice && (
                  <span className="text-xs text-secondary/60 line-through">
                    ฿{look.regularPrice.toLocaleString()}
                  </span>
                )}
                {look.saving > 0 && (
                  <span className="text-[10px] font-bold text-accent hidden sm:inline">
                    (ประหยัด ฿{look.saving.toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            {/* Wireframe Action Button */}
            <div className="flex items-center gap-2">
              {items[0] && (
                <Link
                  to={getProductDetailUrl(items[0].productId)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 active:scale-98 transition-all shadow-sm"
                  id="bottom-bar-action-button"
                >
                  เลือกสินค้าในเซ็ต &rarr;
                </Link>
              )}
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
