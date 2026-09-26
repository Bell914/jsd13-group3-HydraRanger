import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Check, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { getProductById } from "../../services/productService.js";
import { useCartStore } from "../../store/cartStore.js";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const indexA = SIZE_ORDER.indexOf(String(a).toUpperCase());
    const indexB = SIZE_ORDER.indexOf(String(b).toUpperCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return String(a).localeCompare(String(b));
  });
}

export function LookbookBuySetModal({ isOpen, onClose, look }) {
  const navigate = useNavigate();
  const addLookbookSet = useCartStore((state) => state.addLookbookSet);

  const items = look?.items || [];
  const [selectedSizes, setSelectedSizes] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Helper to extract unique, sorted sizes for an item
  const getItemSizes = (item, idx) => {
    const fullProd = productDetails[idx];
    let list = [];
    if (fullProd?.variants?.length) {
      const colorMatches = item.color
        ? fullProd.variants.filter(
            (v) => v.color?.toLowerCase() === item.color?.toLowerCase()
          )
        : [];
      const targetVariants = colorMatches.length > 0 ? colorMatches : fullProd.variants;
      list = targetVariants.map((v) => v.size || v.size_or_color).filter(Boolean);
    }
    if (!list.length) {
      list = item.sizes || ["S", "M", "L"];
    }
    const unique = Array.from(new Set(list));
    return sortSizes(unique);
  };

  // Check if a size is in stock
  const isSizeInStock = (idx, sz, item) => {
    const fullProd = productDetails[idx];
    if (!fullProd?.variants?.length) return true;
    const variant =
      fullProd.variants.find(
        (v) =>
          (v.size === sz || v.size_or_color === sz) &&
          (!item.color || v.color?.toLowerCase() === item.color?.toLowerCase())
      ) ||
      fullProd.variants.find((v) => v.size === sz || v.size_or_color === sz);
    if (!variant) return true;
    const stock = Number(variant.stock_quantity ?? variant.stockQuantity ?? 10);
    return stock > 0;
  };

  // Initialize selected sizes with "M" or first in-stock/available size
  useEffect(() => {
    if (!isOpen || !items.length) return;

    const initial = {};
    items.forEach((item, idx) => {
      const available = getItemSizes(item, idx);
      initial[idx] = available.includes("M") ? "M" : available[0] || "M";
    });
    setSelectedSizes(initial);
    setAddedSuccess(false);

    // Fetch full product details for each item to resolve real variants & stock
    async function fetchProducts() {
      setLoadingProducts(true);
      const details = {};
      await Promise.all(
        items.map(async (item, idx) => {
          try {
            const prod = await getProductById(item.productId);
            if (prod) {
              details[idx] = prod;
            }
          } catch (err) {
            console.warn(`Could not fetch details for product ${item.productId}:`, err.message);
          }
        })
      );
      setProductDetails(details);
      setLoadingProducts(false);
    }

    fetchProducts();
  }, [isOpen, look]);

  // When product details finish loading, ensure selected sizes are valid
  useEffect(() => {
    if (!productDetails || Object.keys(productDetails).length === 0) return;
    setSelectedSizes((prev) => {
      const next = { ...prev };
      items.forEach((item, idx) => {
        const sizes = getItemSizes(item, idx);
        if (!sizes.includes(next[idx])) {
          next[idx] = sizes.includes("M") ? "M" : sizes[0] || "M";
        }
      });
      return next;
    });
  }, [productDetails]);

  if (!isOpen || !look) return null;

  const handleSizeSelect = (itemIdx, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [itemIdx]: size,
    }));
  };

  const prepareSetItems = () => {
    return items.map((item, idx) => {
      const fullProd = productDetails[idx] || {};
      const chosenSize = selectedSizes[idx] || "M";

      // Match the exact variant by size and color
      const variants = fullProd.variants || [];
      const matchedVariant =
        variants.find(
          (v) =>
            (v.size === chosenSize || v.size_or_color === chosenSize) &&
            (!item.color || v.color?.toLowerCase() === item.color?.toLowerCase())
        ) ||
        variants.find((v) => v.size === chosenSize || v.size_or_color === chosenSize) ||
        variants[0] ||
        {
          _id: `${item.productId}-${chosenSize}`,
          sku: `${item.sku || "SKU"}-${chosenSize}`,
          size: chosenSize,
          color: item.color || "Standard",
          price: item.price || 0,
          stockQuantity: 10,
        };

      return {
        product: fullProd._id ? fullProd : { _id: item.productId, productId: item.productId, name: item.name },
        variant: matchedVariant,
        quantity: 1,
        originalPrice: item.price || matchedVariant.price || 0,
      };
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    const setItems = prepareSetItems();
    addLookbookSet({
      lookbook: look,
      items: setItems,
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    const setItems = prepareSetItems();
    addLookbookSet({
      lookbook: look,
      items: setItems,
    });
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-set-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent">
              ซื้อยกเซ็ตพิเศษ
            </span>
            <h3 id="buy-set-modal-title" className="text-lg sm:text-xl font-black text-primary">
              {look.nameTh || look.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {addedSuccess && (
          <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check size={16} className="text-emerald-600" />
            <span>เพิ่มทั้งเซ็ตลงตะกร้าเรียบร้อยแล้ว กำลังปิดหน้าต่าง</span>
          </div>
        )}

        {/* Scrollable Items Selection */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          <p className="text-xs text-stone-500 font-medium">
            เลือกไซซ์สำหรับสินค้าแต่ละชิ้นในเซ็ต
          </p>

          {items.map((item, idx) => {
            const availableSizes = getItemSizes(item, idx);
            const chosenSize = selectedSizes[idx] || "M";
            const isTop = item.sku?.toUpperCase().startsWith("TOP") || idx === 0;

            return (
              <div
                key={item.sku || idx}
                className="flex gap-3.5 p-3 rounded-2xl border border-stone-200 bg-stone-50/70 items-center"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center">
                  <img
                    src={normalizeImageUrl(item.image)}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-accent uppercase">
                    {isTop ? "TOPS เสื้อ" : "BOTTOMS กางเกง"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-primary truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    สี <span className="text-primary font-semibold">{item.color}</span>
                  </p>

                  {/* Size Selector Pills */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold text-stone-600">ไซซ์</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableSizes.map((sz) => {
                        const isSelected = chosenSize === sz;
                        const inStock = isSizeInStock(idx, sz, item);
                        return (
                          <button
                            key={sz}
                            type="button"
                            disabled={!inStock}
                            onClick={() => handleSizeSelect(idx, sz)}
                            className={`h-8 min-w-8 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-primary text-white shadow-xs font-black ring-2 ring-primary ring-offset-1"
                                : inStock
                                ? "border border-stone-300 bg-white text-stone-700 hover:border-primary hover:text-primary hover:bg-stone-50"
                                : "border border-stone-200 bg-stone-100 text-stone-300 line-through cursor-not-allowed"
                            }`}
                            title={!inStock ? "สินค้าหมด" : `ไซซ์ ${sz}`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="pt-3 border-t border-stone-100 bg-stone-50/80 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-5 sm:p-6 space-y-3">
          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between items-center">
              <span>ราคารวมปกติ {items.length} ชิ้น</span>
              <span className="line-through text-stone-400">
                ฿{(look.regularPrice || 0).toLocaleString()}
              </span>
            </div>
            {look.saving > 0 && (
              <div className="flex justify-between items-center font-bold text-emerald-600">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>ส่วนลดเซ็ตพิเศษ</span>
                </span>
                <span>-฿{look.saving.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
              <span className="text-sm font-bold text-primary">ยอดชำระพิเศษทั้งเซ็ต</span>
              <span className="text-xl font-black text-primary">
                ฿{(look.setPrice || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-3 px-4 rounded-xl border border-primary bg-white text-primary hover:bg-stone-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>เพิ่มลงตะกร้า</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>ซื้อเลย</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LookbookBuySetModal;
