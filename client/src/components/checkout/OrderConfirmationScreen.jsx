import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Check,
  Copy,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  Mail,
  HelpCircle,
} from "lucide-react";
import CheckoutStepper from "./CheckoutStepper";

export default function OrderConfirmationScreen({ orderData }) {
  const [copied, setCopied] = useState(false);

  const trackingNumber =
    orderData?.trackingNumber ||
    `OCC-${new Date().getFullYear()}-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const orderDate = new Date().toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    orderId = "OCC-892147",
    shippingData = {},
    email = "customer@example.com",
    items = [],
    subtotal = 0,
    shippingCost = 0,
    taxAmount = 0,
    totalAmount = 0,
  } = orderData || {};

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* 1. Checkout Stepper (Step 4 completed) */}
      <CheckoutStepper currentStep={4} onStepClick={() => {}} />

      {/* 2. Main Order Confirmed Card (Styled for OCCASION Clothing Brand) */}
      <div className="rounded-3xl overflow-hidden shadow-xl border border-neutral-800/10 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] text-white p-6 sm:p-10 text-center relative mb-8">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Fashion Delivery Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-6 text-white shadow-inner">
          <PackageCheck className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400" />
        </div>

        {/* Main Heading */}
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Your OCCASION order is confirmed!
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-md mx-auto font-light leading-relaxed mb-6">
          Are you smiling? You're totally smiling. Get ready to elevate your
          everyday wardrobe.
        </p>

        {/* Divider with Truck */}
        <div className="flex items-center justify-center gap-4 my-6 opacity-75 max-w-xs mx-auto">
          <div className="h-px bg-white/30 flex-1" />
          <Truck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="h-px bg-white/30 flex-1" />
        </div>

        <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest font-semibold mb-2">
          No need to camp out by the mailbox!
        </p>
        <p className="text-sm text-gray-300 mb-2">
          Use this number to track your package:
        </p>

        {/* Tracking Code with copy button */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 hover:bg-white/15 transition-all mb-8">
          <span className="font-mono text-base sm:text-lg font-bold tracking-wider underline underline-offset-4 decoration-emerald-400">
            {trackingNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyTracking}
            title="Copy tracking number"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-gray-300 hover:text-white cursor-pointer"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 3. The Inner White Receipt Sheet */}
        <div className="bg-white text-gray-900 rounded-2xl p-5 sm:p-8 text-left shadow-2xl max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 tracking-tight">
            Here's what we're packing for you:
          </h3>

          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 pb-4 border-b border-gray-200 gap-2">
            <span>
              Order #: <strong className="text-gray-900">{orderId}</strong>
            </span>
            <span>
              Order Date: <strong className="text-gray-900">{orderDate}</strong>
            </span>
          </div>

          {/* Items Table Header */}
          <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider py-3 border-b border-gray-100">
            <span className="col-span-7 sm:col-span-8">ITEM</span>
            <span className="col-span-2 text-center">QTY</span>
            <span className="col-span-3 sm:col-span-2 text-right">COST</span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-gray-100">
            {items && items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.variantId || item._id}
                  className="grid grid-cols-12 py-4 items-center text-xs sm:text-sm gap-2"
                >
                  <div className="col-span-7 sm:col-span-8 flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
                        OCC
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-950">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.color && <span>{item.color}</span>}
                        {item.color && item.size && <span> · </span>}
                        {item.size && <span>Size {item.size}</span>}
                      </p>
                      <p className="text-xs font-semibold text-gray-900 mt-1">
                        ฿{item.price}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 text-center font-medium text-gray-700">
                    {item.quantity}
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-right font-bold text-gray-900">
                    ฿{item.price * item.quantity}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                1x OCCASION Signature Apparel
              </div>
            )}
          </div>

          {/* Shipping Method Note */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <p>
              <strong className="text-gray-900 uppercase">
                SHIPPING METHOD:
              </strong>{" "}
              {shippingData?.shippingMethod === "express"
                ? "Express Shipping (2-4 Business Days)"
                : shippingData?.shippingMethod === "priority"
                ? "Priority Express (1-2 Business Days)"
                : "Free Standard Shipping (2-6 Business Days) (via Kerry Express / Flash)"}
            </p>
            <p className="italic text-gray-400 mt-1">
              *Some outer perimeter regions may take up to 7 business days for
              delivery.
            </p>
          </div>

          {/* Dashed Separator */}
          <div className="border-t-2 border-dashed border-gray-200 my-6" />

          {/* Sent To Section */}
          <div className="text-xs sm:text-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Sent to:</h4>
            <div className="text-gray-700 space-y-0.5">
              <p className="font-bold text-gray-900">
                {shippingData?.firstName || "Valued"}{" "}
                {shippingData?.lastName || "Customer"}
              </p>
              <p>{shippingData?.address || "123 Fashion Blvd"}</p>
              <p>
                {shippingData?.city || "Bangkok"},{" "}
                {shippingData?.state || "Bangkok"}{" "}
                {shippingData?.zipCode || "10110"},{" "}
                {shippingData?.location || "Thailand"}
              </p>
              {shippingData?.phone && (
                <p className="text-gray-500">Tel: {shippingData.phone}</p>
              )}
              <p className="text-gray-500">Email: {email}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>฿{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : `฿${shippingCost}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (Included)</span>
              <span>฿{taxAmount}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-950 pt-3 border-t border-gray-200">
              <span>Total Paid</span>
              <span className="text-[#D0021B]">฿{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Customer Care Note */}
        <p className="mt-8 text-xs sm:text-sm text-gray-400">
          If you have any questions about your order, please{" "}
          <a
            href="mailto:support@occasion.com"
            className="text-white underline font-semibold hover:text-emerald-400 transition-colors"
          >
            contact customer care
          </a>
          .
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>HOME</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

