import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from "lucide-react";
import useCartStore from "../store/cartStore.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";
import { authService } from "../services/authService.js";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } =
    useCartStore();

  const subtotal = getTotalPrice();
  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  const shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shippingFee;

  const handleCheckout = () => {
    navigate(authService.getCurrentUser() ? "/checkout" : "/checkout/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title, Item Count, and Clear Cart Button (จุดที่ 1: ขยับปุ่มลงมาติดเส้นขีด) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-gray-200">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
              Shopping Cart
            </h1>
          </div>
          {cartItems && cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary transition hover:text-accent cursor-pointer mb-0.5"
            >
              <Trash2 size={15} />
              <span>ล้างตะกร้าทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs my-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ตะกร้าสินค้าว่างเปล่า
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              คุณยังไม่ได้เพิ่มสินค้าใดๆ ลงในตะกร้า เริ่มสำรวจคอลเลกชันใหม่เพื่อค้นหาลุคที่ใช่สำหรับคุณ
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition-all shadow-sm"
            >
              <span>ไปเลือกช้อปสินค้า</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.variantId || item._id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/40 transition-colors"
                  >
                    {/* Item Info */}
                    <div className="flex items-start gap-4">
                      {item.imageUrl ? (
                        <img
                          src={normalizeImageUrl ? normalizeImageUrl(item.imageUrl) : item.imageUrl}
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

                        {(item.color || item.size) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {item.color && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                <span>{item.color}</span>
                              </span>
                            )}
                            {item.size && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                <span>Size {item.size}</span>
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-base sm:text-lg font-extrabold text-gray-950 pt-2">
                          <span>฿{item.price * (item.quantity || 1)}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs font-normal text-gray-500 ml-1.5">
                              ฿{(item.price || 0).toLocaleString()} / ชิ้น
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Selector & Delete Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50/60 shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-bold text-gray-900 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= Number(item.stockQuantity ?? item.stock_quantity ?? 0)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-black transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.variantId)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Shipping Badge (จุดที่ 2: ปรับระยะขยับลงมาติดกับปุ่มเลือกซื้อสินค้าต่อด้านล่าง) */}
              <div className="mt-6 flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-600">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>จัดส่งฟรี</strong> สำหรับคำสั่งซื้อตั้งแต่ ฿1,000 ขึ้นไป คืนสินค้าได้ฟรีภายใน 14 วัน
                </span>
              </div>

              <div className="mt-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>เลือกซื้อสินค้าชิ้นอื่นต่อ</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-200">
                  สรุปคำสั่งซื้อ
                </h2>

                <div className="space-y-3 py-4 border-b border-gray-200 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>ราคารวม {totalItemsCount} ชิ้น</span>
                    <span className="font-semibold text-gray-900">
                      ฿{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ค่าจัดส่ง</span>
                    <span className="font-semibold text-gray-900">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold">ฟรี ยอดเกิน ฿1,000</span>
                      ) : (
                        `฿${shippingFee}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-4 pb-2">
                  <span className="text-base font-bold text-gray-900">ยอดชำระสุทธิ</span>
                  <span className="text-2xl font-extrabold text-[#D0021B]">
                    ฿{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  aria-label="Proceed to Checkout"
                  className="w-full mt-4 py-4 px-6 bg-gray-950 hover:bg-black text-white font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>ดำเนินการชำระเงิน</span>
                </button>

                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ช้อปอย่างมั่นใจ รับประกันสินค้าแท้ 100%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
