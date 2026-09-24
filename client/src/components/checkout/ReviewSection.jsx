import React from "react";
import ContactSection from "./ContactSection";
import ShippingSection from "./ShippingSection";
import PaymentSection from "./PaymentSection";

export default function ReviewSection({
  email,
  shippingData,
  paymentData,
  onEditStep,
  onBack,
  onPlaceOrder,
  isSubmitting,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ตรวจสอบคำสั่งซื้อ</h2>
      {/* 1. Contact Summary */}
      <ContactSection
        email={email}
        isCollapsed={true}
        onEdit={() => onEditStep(1)}
      />

      {/* 2. Shipping Summary */}
      <ShippingSection
        shippingData={shippingData}
        isCollapsed={true}
        onEdit={() => onEditStep(2)}
      />

      {/* 3. Payment Summary */}
      <PaymentSection
        paymentData={paymentData}
        isCollapsed={true}
        onEdit={() => onEditStep(3)}
      />

      {/* Terms & Place Order Box */}
      <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
        <p className="text-xs text-gray-600 text-center mb-6">
          เมื่อยืนยันคำสั่งซื้อ ถือว่าคุณยอมรับ{" "}
          <span className="underline cursor-pointer font-medium hover:text-black">
            ข้อกำหนดการใช้งาน
          </span>{" "}
          และ{" "}
          <span className="underline cursor-pointer font-medium hover:text-black">
            นโยบายความเป็นส่วนตัว
          </span>
          .
        </p>

        {/* Bottom Buttons: ย้อนกลับ (Back) and PLACE ORDER */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="w-full sm:w-36 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded-lg transition-colors text-center cursor-pointer disabled:opacity-50"
          >
            ย้อนกลับ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onPlaceOrder}
            className="w-full sm:flex-1 py-3.5 bg-[#D0021B] hover:bg-[#b00217] text-white font-bold text-sm tracking-wider uppercase rounded-lg transition-colors shadow-xs text-center cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
          </button>
        </div>
      </div>
    </div>
  );
}

