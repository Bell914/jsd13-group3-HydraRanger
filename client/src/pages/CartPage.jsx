import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import useCartStore from "../store/cartStore.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } =
    useCartStore();

  const subtotal = getTotalPrice();
  const totalItemsCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

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
                          src={normalizeImageUrl(item.imageUrl) || item.imageUrl}
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

              {/* Free returns info badge */}
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-xs text-gray-600">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Free Standard Delivery</strong> on all orders. Free 14-day
                  returns online and in store.
                </span>
              </div>
            </div>

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
      </div>
    </div>
  );
}