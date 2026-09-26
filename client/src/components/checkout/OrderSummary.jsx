import React, { useState } from "react";
import { Tag, AlertCircle, Check } from "lucide-react";
import { SHIPPING_METHODS } from "./ShippingSection";

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingMethodId,
  userRank = 'MEMBER',
  rankDiscountAmount = 0,
  appliedCoupon = null,
  couponDiscountAmount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading = false,
  couponError = "",
}) {
  const [inputCode, setInputCode] = useState("");

  const handleApply = (e) => {
    e?.preventDefault();
    if (!inputCode.trim() || couponLoading) return;
    onApplyCoupon?.(inputCode.trim());
  };

  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ||
    SHIPPING_METHODS[0];

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  
  const totalDiscount = Math.max(rankDiscountAmount, couponDiscountAmount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const orderTotal = discountedSubtotal + shippingCost;

  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-xl font-bold text-gray-900">สรุปคำสั่งซื้อ</h2>
        <span className="text-sm font-medium text-gray-600">
          {totalItemsCount} ชิ้น
        </span>
      </div>

      {/* Item List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.variantId || item._id}
            className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-20 object-cover rounded bg-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                ไม่มีรูปภาพ
              </div>
            )}

            <div className="flex-1 text-xs space-y-1">
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              {item.color && (
                <p className="text-gray-600">
                  สี <span className="text-gray-900">{item.color}</span>
                </p>
              )}
              {item.size && (
                <p className="text-gray-600">
                  ไซซ์ <span className="text-gray-900">{item.size}</span>
                </p>
              )}
              <div className="flex items-center justify-between pt-1 font-semibold text-gray-900">
                <span>จำนวน {item.quantity} ชิ้น</span>
                <span className="text-sm">฿{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-4">
        คืนสินค้าฟรีทั้งหน้าร้านและออนไลน์
      </p>

      {/* Promo / Coupon Code Section */}
      <div className="pt-4 pb-3 border-t border-gray-200">
        <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Tag size={13} className="text-gray-500" />
          <span>โค้ดส่วนลด</span>
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-rose-700 text-xs sm:text-sm">
                {appliedCoupon.code}
              </span>
              <span className="text-[11px] bg-rose-100 text-rose-800 font-semibold px-1.5 py-0.5 rounded">
                ลด {appliedCoupon.discountValue}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputCode("");
                onRemoveCoupon?.();
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium underline"
            >
              นำออก
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ใส่โค้ดส่วนลด"
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-black"
                disabled={couponLoading}
              />
              <button
                type="submit"
                disabled={!inputCode.trim() || couponLoading}
                className="px-3 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {couponLoading ? "กำลังตรวจสอบ..." : "ใช้งาน"}
              </button>
            </form>
            {couponError && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={13} className="shrink-0" />
                <span>{couponError}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2 text-sm pt-2 border-t border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>ราคารวมสินค้า</span>
          <span className="font-semibold text-gray-900">฿{subtotal.toLocaleString()}</span>
        </div>

        {rankDiscountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
            <span>ส่วนลดสมาชิก {userRank}</span>
            <span>-฿{rankDiscountAmount.toLocaleString()}</span>
          </div>
        )}

        {couponDiscountAmount > 0 && (
          <div className="flex justify-between text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
            <span>ส่วนลดคูปอง {appliedCoupon?.code}</span>
            <span>-฿{couponDiscountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>ค่าจัดส่ง</span>
          <span className="font-semibold text-gray-900">
            {shippingCost === 0 ? "ฟรี" : `฿${shippingCost}`}
          </span>
        </div>

        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>ยอดชำระสุทธิ</span>
          <span>฿{orderTotal}</span>
        </div>
      </div>
    </div>
  );
}

