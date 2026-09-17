import React from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCartStore } from "../store/cartStore.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalCount,
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount ? getTotalCount() : cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const shippingFee = totalPrice >= 1000 || totalPrice === 0 ? 0 : 50;
  const grandTotal = totalPrice + shippingFee;

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="flex-1 bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-accent/10 text-accent">
            <ShoppingBag size={48} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            ตะกร้าสินค้าว่างเปล่า
          </h1>
          <p className="mt-3 text-sm text-secondary sm:text-base">
            คุณยังไม่ได้เพิ่มสินค้าใดๆ ลงในตะกร้า เริ่มสำรวจคอลเลกชันใหม่เพื่อค้นหาลุคที่ใช่สำหรับคุณ
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95"
            >
              <span>ไปเลือกช้อปสินค้า</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
              ตะกร้าสินค้าของคุณ ({totalCount} ชิ้น)
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-secondary">
              ตรวจสอบรายการสินค้าและจำนวนก่อนดำเนินการสั่งซื้อ
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-secondary transition hover:text-accent cursor-pointer"
          >
            <Trash2 size={15} />
            <span>ล้างตะกร้าทั้งหมด</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cartItems.map((item) => {
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              const imageUrl = item.imageUrl ? (normalizeImageUrl ? normalizeImageUrl(item.imageUrl) : item.imageUrl) : "";

              return (
                <div
                  key={item.variantId || item._id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-occasion-border/40 bg-surface p-4 sm:p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link
                      to={`/products/${item.productId}`}
                      className="shrink-0 overflow-hidden rounded-xl bg-background/50"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium shrink-0">
                          OCCASION
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="text-base sm:text-lg font-bold text-primary hover:text-accent transition-colors line-clamp-1"
                      >
                        {item.name || "Apparel Item"}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-secondary">
                        {item.color && (
                          <span className="rounded-md bg-background px-2 py-0.5 font-medium">
                            สี: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="rounded-md bg-background px-2 py-0.5 font-medium">
                            ไซส์: {item.size}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-extrabold text-primary">
                        ฿{(item.price || 0).toLocaleString()} / ชิ้น
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t border-occasion-border/20 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center rounded-xl border border-occasion-border/60 bg-surface">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-secondary transition hover:text-primary cursor-pointer"
                        aria-label="ลดจำนวน"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-primary">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.stockQuantity ? item.quantity >= item.stockQuantity : false}
                        className="flex h-9 w-9 items-center justify-center text-secondary transition hover:text-primary disabled:opacity-40 cursor-pointer"
                        aria-label="เพิ่มจำนวน"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-primary">
                        ฿{itemTotal.toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.variantId)}
                      className="rounded-lg p-2 text-secondary/60 hover:bg-accent/10 hover:text-accent transition cursor-pointer"
                      title="ลบรายการนี้"
                      aria-label={`ลบ ${item.name} ออกจากตะกร้า`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center gap-3 p-4 bg-surface border border-occasion-border/40 rounded-xl text-xs text-secondary">
              <Truck size={18} className="text-emerald-600 shrink-0" />
              <span>
                <strong>จัดส่งฟรี</strong> สำหรับคำสั่งซื้อตั้งแต่ ฿1,000 ขึ้นไป คืนสินค้าได้ฟรีภายใน 14 วัน
              </span>
            </div>

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft size={16} />
                <span>เลือกซื้อสินค้าชิ้นอื่นต่อ</span>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 rounded-2xl border border-occasion-border/40 bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary border-b border-occasion-border/30 pb-3">
              สรุปคำสั่งซื้อ
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-secondary">
                <span>ราคารวม ({totalCount} ชิ้น)</span>
                <span className="font-semibold text-primary">฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>ค่าจัดส่ง</span>
                <span className="font-semibold text-primary">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">ฟรี</span>
                  ) : (
                    `฿${shippingFee}`
                  )}
                </span>
              </div>
              <div className="border-t border-occasion-border/30 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-primary">ยอดชำระสุทธิ</span>
                <span className="text-2xl font-black text-accent">
                  ฿{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/checkout"
                className="block text-center w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition-all cursor-pointer"
              >
                ดำเนินการชำระเงิน
              </Link>
            </div>

            <div className="mt-4 rounded-xl bg-background/60 p-3 text-[11px] text-secondary text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>ช้อปอย่างมั่นใจ รับประกันสินค้าแท้ 100%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;