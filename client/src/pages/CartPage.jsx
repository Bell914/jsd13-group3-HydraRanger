import React from "react";
import { Link } from "react-router-dom";
import {
<<<<<<< HEAD
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
=======
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import useCartStore from "../store/cartStore";
>>>>>>> develop

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } =
    useCartStore();

<<<<<<< HEAD
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
=======
  const subtotal = getTotalPrice();
  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );
>>>>>>> develop

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Item Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            {totalItemsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800 text-xs sm:text-sm font-semibold">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

<<<<<<< HEAD
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
=======
        {/* Empty State */}
        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Your shopping bag is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our
              unisex collection to find your fit.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition-all shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Content Layout: 2 Columns on Desktop, 1 Column on Mobile */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.variantId || item._id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition-colors"
                  >
                    {/* Item Info (Image + Details) */}
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-gray-100 border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-medium flex-shrink-0">
                          OCCASION
                        </div>
                      )}

                      <div className="space-y-1">
                        <Link
                          to={`/products/${item.productId}`}
                          className="font-bold text-base sm:text-lg text-gray-900 hover:underline line-clamp-1 block"
                        >
                          {item.name || "Apparel Item"}
                        </Link>

                        {/* Variant Pills */}
                        {(item.color || item.size) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {item.color && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Size {item.size}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-base sm:text-lg font-extrabold text-gray-950 pt-2">
                          ฿{item.price}
                        </p>
>>>>>>> develop
                      </div>
                    </div>

                    {/* Quantity Selector & Delete Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50/60 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-bold text-gray-900 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer text-sm font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

<<<<<<< HEAD
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
=======
              {/* Free returns info badge */}
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-600">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Free Standard Delivery</strong> on all orders. Free 14-day
                  returns online and in store.
                </span>
              </div>
            </div>
>>>>>>> develop

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-200">
                  Order Summary
                </h2>

                <div className="space-y-3 py-4 border-b border-gray-200 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ฿{subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-emerald-600">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

<<<<<<< HEAD
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
=======
                <div className="flex justify-between items-baseline pt-4 pb-2">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-gray-950">
                    ฿{subtotal}
                  </span>
                </div>

                {/* Newly Designed Proceed to Checkout Button */}
                <Link
                  to="/checkout"
                  className="group relative w-full mt-4 py-4 px-6 bg-gray-950 hover:bg-black text-white font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Trust and Guarantee footnote */}
                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>Encrypted &amp; Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
>>>>>>> develop
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default CartPage;
=======
}
>>>>>>> develop
