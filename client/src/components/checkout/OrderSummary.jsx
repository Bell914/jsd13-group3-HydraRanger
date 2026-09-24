import React from "react";
import { SHIPPING_METHODS } from "./ShippingSection";

export default function OrderSummary({
  cartItems,
  subtotal,
  shippingMethodId,
  currentStep,
  userRank = 'MEMBER',
  rankDiscountAmount = 0,
}) {
  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ||
    SHIPPING_METHODS[0];

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  
  // Tax: calculated at step 3 and 4, or show calculated amount
  const taxRate = 0.06; // standard sales tax approximation
  const discountedSubtotal = Math.max(0, subtotal - rankDiscountAmount);
  const taxAmount = currentStep >= 3 ? Math.round(discountedSubtotal * taxRate * 100) / 100 : 0;
  const orderTotal = discountedSubtotal + shippingCost + taxAmount;

  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
        <span className="text-sm font-medium text-gray-600">
          {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
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
                No Image
              </div>
            )}

            <div className="flex-1 text-xs space-y-1">
              <h3 className="font-bold text-sm text-gray-900 line-clamp-2">
                {item.name}
              </h3>
              {item.color && (
                <p className="text-gray-600">
                  Color <span className="text-gray-900">{item.color}</span>
                </p>
              )}
              {item.size && (
                <p className="text-gray-600">
                  Size <span className="text-gray-900">{item.size}</span>
                </p>
              )}
              <div className="flex items-center justify-between pt-1 font-semibold text-gray-900">
                <span>Quantity {item.quantity}</span>
                <span className="text-sm">฿{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Free returns online and in-store
      </p>

      {/* Cost Breakdown */}
      <div className="space-y-2 text-sm pt-2 border-t border-gray-200">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900">฿{subtotal.toLocaleString()}</span>
        </div>

        {rankDiscountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
            <span>ส่วนลดสมาชิก ({userRank})</span>
            <span>-฿{rankDiscountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-semibold text-gray-900">
            {shippingCost === 0 ? "FREE" : `฿${shippingCost}`}
          </span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Tax</span>
          <span className="text-gray-600">
            {currentStep < 3 ? "Calculated at next step" : `฿${taxAmount}`}
          </span>
        </div>

        <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>Order total</span>
          <span>฿{orderTotal}</span>
        </div>
      </div>
    </div>
  );
}

