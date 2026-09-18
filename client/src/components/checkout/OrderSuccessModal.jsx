import React from "react";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderSuccessModal({
  orderId,
  shippingData,
  email,
  totalAmount,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank you for your order!
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          We've received your order and are getting it ready for shipment. A confirmation email has been sent to{" "}
          <span className="font-semibold text-gray-900">{email}</span>.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Order Number</span>
            <span className="font-bold text-gray-900">{orderId}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Recipient</span>
            <span className="font-semibold text-gray-900">
              {shippingData.firstName} {shippingData.lastName}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-500">Delivery Address</span>
            <span className="text-right text-gray-800 max-w-[220px] truncate">
              {shippingData.address}, {shippingData.city}
            </span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-base">
            <span className="text-gray-900">Total Paid</span>
            <span className="text-[#D0021B]">฿{totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/products"
            className="flex-1 py-3 px-4 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <Link
            to="/"
            className="py-3 px-6 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span>Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

