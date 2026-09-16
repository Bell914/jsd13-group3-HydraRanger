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
          By placing an order, you agree to be bound by OCCASION's{" "}
          <span className="underline cursor-pointer font-medium hover:text-black">
            Terms of Use
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer font-medium hover:text-black">
            Privacy Policy
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
            {isSubmitting ? "PROCESSING..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </div>
  );
}

