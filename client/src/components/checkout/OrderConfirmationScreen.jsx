import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Check,
  Copy,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import CheckoutStepper from "./CheckoutStepper";

const RANK_LABELS = {
  MEMBER: "สมาชิก",
  BRONZE: "บรอนซ์",
  SILVER: "ซิลเวอร์",
  GOLD: "โกลด์",
  PLATINUM: "แพลทินัม",
};

const getRankLabel = (rank) => RANK_LABELS[rank] || rank;

export default function OrderConfirmationScreen({ orderData }) {
  const [copied, setCopied] = useState(false);
  const [trackingNumber] = useState(
    () =>
      orderData?.trackingNumber ||
      `OCC-${new Date().getFullYear()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
  );

  const orderDate = new Date().toLocaleDateString("th-TH", {
    month: "long",
    day: "numeric",
    year: "numeric",
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
    rankDiscountAmount = 0,
    userRank = "MEMBER",
    upgradedRank,
    shippingCost = 0,
    totalAmount = 0,
  } = orderData || {};

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* 1. Checkout Stepper (Step 4 completed) */}
      <CheckoutStepper currentStep={4} onStepClick={() => {}} />

      {/* 2. Main Order Confirmed Card (Styled for OCCASION Clothing Brand) */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center text-gray-900 shadow-sm sm:p-10">

        {/* Fashion Delivery Icon */}
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm sm:h-20 sm:w-20">
          <PackageCheck className="h-9 w-9 sm:h-11 sm:w-11" />
        </div>

        {/* Rank Upgrade Celebration Banner */}
        {upgradedRank && (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 text-sm font-black text-amber-800">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
              <span>ยินดีด้วย! คำสั่งซื้อนี้ทำให้คุณเลื่อนระดับเป็น {getRankLabel(upgradedRank)} 🎉</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800">
              ระบบปลดล็อกสิทธิพิเศษและส่วนลดเพิ่มเติมให้คุณทันที
            </p>
          </div>
        )}

        {/* Main Heading */}
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm font-light leading-relaxed text-gray-600 sm:text-base">
          เตรียมพร้อมยกระดับสไตล์การแต่งกายของคุณได้เลย!
        </p>

        {/* Divider with Truck */}
        <div className="mx-auto my-6 flex max-w-xs items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <Truck className="h-5 w-5 flex-shrink-0 text-orange-600" />
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <p className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
          ไม่ต้องนั่งเฝ้าหน้าตู้โพสต์แมน!
        </p>
        <p className="mb-2 text-sm text-gray-600">
          ใช้หมายเลขนี้เพื่อติดตามพัสดุของคุณ:
        </p>

        {/* Tracking Code with copy button */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-gray-900 transition-colors hover:bg-orange-100">
          <span className="font-mono text-base font-bold tracking-wider underline decoration-orange-600 underline-offset-4 sm:text-lg">
            {trackingNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyTracking}
            title="คัดลอกหมายเลขติดตามพัสดุ"
            aria-label={copied ? "คัดลอกหมายเลขแล้ว" : "คัดลอกหมายเลขติดตามพัสดุ"}
            className="cursor-pointer rounded-lg p-1.5 text-orange-700 transition-colors hover:bg-orange-100 hover:text-orange-800"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 3. The Inner White Receipt Sheet */}
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 text-left text-gray-900 shadow-sm sm:p-8">
          <h3 className="mb-6 text-center text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            รายการสินค้าที่เรากำลังเตรียมจัดส่งให้คุณ:
          </h3>

          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 pb-4 border-b border-gray-200 gap-2">
            <span>
              หมายเลขคำสั่งซื้อ: <strong className="text-gray-900">{orderId}</strong>
            </span>
            <span>
              วันที่สั่งซื้อ: <strong className="text-gray-900">{orderDate}</strong>
            </span>
          </div>

          {/* Items Table Header */}
          <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider py-3 border-b border-gray-100">
            <span className="col-span-7 sm:col-span-8">รายการสินค้า</span>
            <span className="col-span-2 text-center">จำนวน</span>
            <span className="col-span-3 sm:col-span-2 text-right">ราคา</span>
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
                        {item.color && <span>สี {item.color}</span>}
                        {item.color && item.size && <span> · </span>}
                        {item.size && <span>ไซซ์ {item.size}</span>}
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
                สินค้าคอลเลกชัน Signature จาก OCCASION 1 ชิ้น
              </div>
            )}
          </div>

          {/* Shipping Method Note */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <p>
              <strong className="text-gray-900 uppercase">
                วิธีการจัดส่ง:
              </strong>{" "}
              {shippingData?.shippingMethod === "express"
                ? "จัดส่งด่วน (2-4 วันทำการ)"
                : shippingData?.shippingMethod === "priority"
                ? "จัดส่งพิเศษ (1-2 วันทำการ)"
                : "จัดส่งแบบมาตรฐานฟรี (2-6 วันทำการ) (โดย Kerry Express / Flash)"}
            </p>
            <p className="italic text-gray-400 mt-1">
              *พื้นที่ห่างไกลหรือต่างจังหวัดอาจใช้เวลาจัดส่งสูงสุด 7 วันทำการ
            </p>
          </div>

          {/* Dashed Separator */}
          <div className="border-t-2 border-dashed border-gray-200 my-6" />

          {/* Sent To Section */}
          <div className="text-xs sm:text-sm">
            <h4 className="mb-2 text-sm font-bold text-gray-900">จัดส่งไปยัง:</h4>
            <div className="text-gray-700 space-y-0.5">
              <p className="font-bold text-gray-900">
                {[shippingData?.firstName, shippingData?.lastName].filter(Boolean).join(" ") || "ลูกค้า"}
              </p>
              <p>{shippingData?.address || "123 ถนนแฟชั่น"}</p>
              <p>
                {shippingData?.city || "กรุงเทพมหานคร"},{" "}
                {shippingData?.state || "กรุงเทพมหานคร"}{" "}
                {shippingData?.zipCode || "10110"},{" "}
                {shippingData?.location || "ประเทศไทย"}
              </p>
              {shippingData?.phone && (
                <p className="text-gray-500">เบอร์โทรศัพท์: {shippingData.phone}</p>
              )}
              <p className="text-gray-500">อีเมล: {email}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>ราคารวมสินค้า</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {rankDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                <span>ส่วนลดสมาชิก ({getRankLabel(userRank)})</span>
                <span>-฿{rankDiscountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>ค่าจัดส่ง</span>
              <span>{shippingCost === 0 ? "ฟรี" : `฿${shippingCost}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-950 pt-3 border-t border-gray-200">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-[#D0021B]">฿{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Customer Care Note */}
        <p className="mt-8 text-xs text-gray-600 sm:text-sm">
          หากมีข้อสงสัยเกี่ยวกับคำสั่งซื้อของคุณ โปรด{" "}
          <a
            href="mailto:support@occasion.com"
            className="font-semibold text-orange-700 underline transition-colors hover:text-orange-800"
          >
            ติดต่อฝ่ายบริการลูกค้า
          </a>
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/products"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-sm transition-all hover:bg-gray-800 sm:w-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>เลือกซื้อสินค้าต่อ</span>
          </Link>
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            <span>กลับหน้าแรก</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

