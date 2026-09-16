import React, { useState } from "react";
import { CreditCard, Plus, Check } from "lucide-react";

export default function PaymentSection({
  paymentData,
  onChangePayment,
  isCollapsed,
  onEdit,
  onContinue,
  onBack,
}) {
  const [expandedOption, setExpandedOption] = useState(
    paymentData.method || "credit-card"
  );
  const [giftCardOpen, setGiftCardOpen] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (expandedOption === "credit-card") {
      if (!paymentData.cardNumber?.trim()) {
        errs.cardNumber = "กรุณากรอกหมายเลขบัตร";
      } else if (paymentData.cardNumber.replace(/\s/g, "").length < 16) {
        errs.cardNumber = "หมายเลขบัตรต้องมี 16 หลัก";
      }
      if (!paymentData.cardExp?.trim()) {
        errs.cardExp = "กรุณากรอกวันหมดอายุ (MM/YY)";
      }
      if (!paymentData.cardCvv?.trim()) {
        errs.cardCvv = "กรุณากรอก CVV (3 หลัก)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onChangePayment({ ...paymentData, method: expandedOption });
      onContinue();
    }
  };

  const handleApplyGiftCard = (e) => {
    e.preventDefault();
    if (giftCardCode.trim()) {
      setGiftCardApplied(true);
    }
  };

  // Helper to format card number with spaces
  const handleCardNumberChange = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, "$1 ");
    onChangePayment({ ...paymentData, cardNumber: formatted });
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: null });
  };

  // Helper to format Exp date
  const handleExpChange = (val) => {
    let clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    onChangePayment({ ...paymentData, cardExp: clean });
    if (errors.cardExp) setErrors({ ...errors, cardExp: null });
  };

  // Collapsed View for Step 4 (Review)
  if (isCollapsed) {
    const last4 = paymentData.cardNumber
      ? paymentData.cardNumber.replace(/\s/g, "").slice(-4)
      : "1172";

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Mastercard styled circle icon */}
          <div className="flex items-center">
            <span className="w-5 h-5 rounded-full bg-[#EB001B] inline-block -mr-2" />
            <span className="w-5 h-5 rounded-full bg-[#F79E1B]/90 inline-block" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {paymentData.method === "paypal"
              ? "PayPal"
              : paymentData.method === "promptpay"
              ? "PromptPay QR"
              : `Mastercard ending in ${last4}`}
          </span>
        </div>
      </div>
    );
  }

  // Active Payment Form for Step 3
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment</h2>

      {/* Gift Card Box */}
      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
            <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-extrabold">
              Ω
            </span>
            <span>Use my Gift Card</span>
          </div>
        </div>

        {!giftCardApplied ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setGiftCardOpen(!giftCardOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800 hover:text-black transition-colors underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a gift card</span>
            </button>

            {giftCardOpen && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter gift card code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
                <button
                  type="button"
                  onClick={handleApplyGiftCard}
                  className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>Gift card applied: {giftCardCode}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Accordion List */}

        {/* 1. PayPal */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setExpandedOption("paypal");
              onChangePayment({ ...paymentData, method: "paypal" });
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold italic text-blue-700 font-serif">
                PayPal
              </span>
              <span className="text-sm font-semibold text-gray-800">PayPal</span>
            </div>
            <Plus
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedOption === "paypal" ? "rotate-45" : ""
              }`}
            />
          </button>
          {expandedOption === "paypal" && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              You will be redirected to PayPal to complete your purchase securely.
            </div>
          )}
        </div>

        {/* 2. Afterpay */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setExpandedOption("afterpay");
              onChangePayment({ ...paymentData, method: "afterpay" });
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#B2FCE4] text-black font-extrabold text-xs rounded">
                Afterpay
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Afterpay
                </span>
                <span className="text-xs text-gray-500">
                  4 payments, every two weeks
                </span>
              </div>
            </div>
            <Plus
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedOption === "afterpay" ? "rotate-45" : ""
              }`}
            />
          </button>
          {expandedOption === "afterpay" && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Pay in 4 interest-free installments every 2 weeks.
            </div>
          )}
        </div>

        {/* 3. Klarna */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setExpandedOption("klarna");
              onChangePayment({ ...paymentData, method: "klarna" });
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#FFB3C7] text-black font-bold text-xs rounded">
                Klarna.
              </span>
              <div>
                <span className="text-sm font-semibold text-gray-900 block">
                  Klarna
                </span>
                <span className="text-xs text-gray-500">
                  4 payments, every two weeks
                </span>
              </div>
            </div>
            <Plus
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedOption === "klarna" ? "rotate-45" : ""
              }`}
            />
          </button>
          {expandedOption === "klarna" && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              Split into 4 interest-free payments with Klarna.
            </div>
          )}
        </div>

        {/* 4. Credit card */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setExpandedOption("credit-card");
              onChangePayment({ ...paymentData, method: "credit-card" });
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">
                Credit card
              </span>
            </div>
            <Plus
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expandedOption === "credit-card" ? "rotate-45" : ""
              }`}
            />
          </button>

          {expandedOption === "credit-card" && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="xxxx xxxx xxxx 1172"
                  value={paymentData.cardNumber || ""}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded text-sm focus:outline-none focus:ring-1 ${
                    errors.cardNumber
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-black"
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={paymentData.cardExp || ""}
                    onChange={(e) => handleExpChange(e.target.value)}
                    className={`w-full px-3 py-2 bg-white border rounded text-sm focus:outline-none focus:ring-1 ${
                      errors.cardExp
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  {errors.cardExp && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardExp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    value={paymentData.cardCvv || ""}
                    onChange={(e) => {
                      onChangePayment({
                        ...paymentData,
                        cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      });
                      if (errors.cardCvv)
                        setErrors({ ...errors, cardCvv: null });
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded text-sm focus:outline-none focus:ring-1 ${
                      errors.cardCvv
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-black"
                    }`}
                  />
                  {errors.cardCvv && (
                    <p className="text-xs text-red-500 mt-1">{errors.cardCvv}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Buttons: ย้อนกลับ (Back) and CONTINUE */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-36 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded-lg transition-colors text-center cursor-pointer"
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            className="w-full sm:flex-1 py-3.5 bg-[#D0021B] hover:bg-[#b00217] text-white font-bold text-sm tracking-wider uppercase rounded-lg transition-colors shadow-xs text-center cursor-pointer"
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
}

