import React from "react";
import { Heart, Share2, Ruler, Minus, Plus, ShoppingBag } from "lucide-react";

export const ProductBuySection = ({
  product,
  colors = [],
  selectedColor,
  onColorChange,
  sizeOptions = [],
  selectedSize,
  onSizeChange,
  onOpenSizeGuide,
  currentPrice = 490,
  quantity = 1,
  onQuantityChange,
  validationError,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const getColorHex = (colorName = "", colorCode = "") => {
    // If colorCode is a hex value, use it directly
    if (colorCode && colorCode.startsWith("#")) return colorCode;
    // Fallback: derive from color name
    const c = colorName.toLowerCase();
    if (c.includes("white")) return "#f8f9fa";
    if (c.includes("charcoal")) return "#374151";
    if (c.includes("blue")) return "#38bdf8";
    if (c.includes("forest")) return "#15803d";
    if (c.includes("indigo")) return "#312e81";
    if (c.includes("taupe")) return "#a8a29e";
    if (c.includes("black")) return "#111827";
    if (c.includes("olive")) return "#65a30d";
    if (c.includes("navy")) return "#1e3a5f";
    if (c.includes("sand")) return "#c2b280";
    if (c.includes("red")) return "#dc2626";
    if (c.includes("terracotta")) return "#c87941";
    if (c.includes("gray") || c.includes("grey")) return "#9ca3af";
    return "#0046a7";
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert("คัดลอกลิงก์สินค้าเรียบร้อยแล้ว!");
  };

  return (
    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
      <div>
        {/* Title & Share / Wishlist */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              {product.name}
            </h1>
            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full p-2 text-secondary hover:bg-slate-200 transition cursor-pointer"
              title="แชร์สินค้า"
              aria-label="แชร์ลิงก์สินค้านี้"
            >
              <Share2 size={20} />
            </button>
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`rounded-full p-2 transition cursor-pointer ${
                isWishlisted
                  ? "text-red-500 hover:bg-red-50"
                  : "text-secondary hover:bg-slate-200"
              }`}
              title="บันทึกในรายการโปรด"
              aria-label="บันทึกสินค้านี้ในรายการโปรด"
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Color Selection */}
        <div className="mt-5">
          <p className="text-sm font-bold text-primary mb-2">
            สี : <span className="font-semibold text-secondary">{selectedColor || "เลือกสี"}</span>
          </p>
          <div className="flex items-center gap-2.5">
            {colors.map((colorObj) => {
              const { color, colorCode } = typeof colorObj === "string"
                ? { color: colorObj, colorCode: "" }
                : colorObj;
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => onColorChange(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary ring-2 ring-accent scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: getColorHex(color, colorCode) }}
                  title={color}
                  aria-label={`เลือกสี ${color}`}
                />
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-primary">
              ขนาด : <span className="text-secondary font-semibold">{selectedSize}</span>
            </span>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent underline transition cursor-pointer"
            >
              <Ruler size={14} />
              <span>ตารางไซส์</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {sizeOptions.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onSizeChange(size)}
                  className={`min-w-[56px] sm:min-w-[68px] rounded-xl py-2.5 px-4 text-sm font-extrabold transition-all cursor-pointer text-center shadow-xs ${
                    isSelected
                      ? "bg-primary text-white shadow ring-2 ring-accent scale-102"
                      : "border border-occasion-border/60 bg-white text-secondary hover:border-primary hover:text-primary hover:scale-102"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-secondary">
            ขนาด: ผู้หญิง {selectedSize} (ทรง Relaxed พอดีตัว)
          </p>
        </div>

        {/* Price Display */}
        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-primary">
            ฿{currentPrice.toLocaleString()}.00
          </span>
          <span className="text-base font-bold text-secondary">บาท</span>
        </div>

        {/* Quantity Stepper & Stock Notification */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center rounded-xl border border-occasion-border/60 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 text-secondary hover:text-primary transition cursor-pointer disabled:opacity-40"
              disabled={quantity <= 1}
              aria-label="ลดจำนวน"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-bold text-primary">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="px-3 py-1.5 text-secondary hover:text-primary transition cursor-pointer"
              aria-label="เพิ่มจำนวน"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
            ✓ มีสินค้าพร้อมจัดส่งทันที
          </div>
        </div>

        {validationError && (
          <p className="mt-2 text-xs font-bold text-red-600">
            {validationError}
          </p>
        )}

        {/* Add to Cart Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full rounded-2xl bg-[#1a1a1a] py-4 text-base font-extrabold text-white shadow-xl hover:bg-black active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            <span>เพิ่มลงในตะกร้า</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBuySection;
