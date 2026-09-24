import React, { useState } from "react";
import { Check, CreditCard, Plus } from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "paypal", name: "PayPal" },
  { id: "afterpay", name: "Afterpay" },
  { id: "klarna", name: "Klarna" },
  { id: "credit-card", name: "Credit / Debit Card" },
];

export default function PaymentSection({
  paymentData,
  onChangePayment,
  isCollapsed,
  onEdit,
  onContinue,
  onBack,
}) {
  const [selectedMethod, setSelectedMethod] = useState(
    paymentData.method || "credit-card",
  );
  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardOpen, setGiftCardOpen] = useState(false);
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const [error, setError] = useState("");

  function selectPaymentMethod(method) {
    setSelectedMethod(method);
    onChangePayment({ method });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      selectedMethod === "credit-card" &&
      !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    ) {
      setError("ระบบชำระเงินยังไม่ได้ตั้งค่า Stripe");
      return;
    }

    onChangePayment({ method: selectedMethod });
    onContinue();
  }

  function applyGiftCard() {
    if (giftCardCode.trim()) setGiftCardApplied(true);
  }

  if (isCollapsed) {
    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          {onEdit && (
            <button type="button" onClick={onEdit} className="text-sm font-semibold underline">
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-medium">
            {paymentData.method === "paypal"
              ? "PayPal"
              : paymentData.method === "promptpay"
                ? "PromptPay QR"
                : "ชำระผ่านบัตรเครดิต/เดบิต"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Payment</h2>

      <div className="mb-4 rounded-lg border border-gray-200 p-4">
        <strong className="flex items-center gap-2 text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black font-serif text-xs text-white">
            Ω
          </span>
          Use my Gift Card
        </strong>

        {!giftCardApplied ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setGiftCardOpen(!giftCardOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold underline"
            >
              <Plus size={14} /> ใส่รหัส Gift Card
            </button>
            {giftCardOpen && (
              <div className="mt-3 flex gap-2">
                <input
                  value={giftCardCode}
                  onChange={(event) => setGiftCardCode(event.target.value)}
                  placeholder="กรอกรหัส Gift Card หรือคูปองส่วนลด"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-xs"
                />
                <button type="button" onClick={applyGiftCard} className="rounded bg-black px-4 py-2 text-xs text-white">
                  ใช้งาน
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
            <Check size={16} /> ใช้รหัส {giftCardCode} เรียบร้อยแล้ว
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <div key={option.id} className="overflow-hidden rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => selectPaymentMethod(option.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50"
              >
                <span className="flex items-center gap-3">
                  {option.id === "credit-card" && <CreditCard size={20} />}
                  <span className="text-sm font-semibold">{option.name}</span>
                </span>
                <Plus className={`h-4 w-4 transition-transform ${isSelected ? "rotate-45" : ""}`} />
              </button>
              {isSelected && option.id === "credit-card" && (
                <p className="border-t bg-gray-50 p-4 text-sm text-gray-600">
                  กรอกข้อมูลบัตรอย่างปลอดภัยผ่าน Stripe ในขั้นตอนถัดไป
                </p>
              )}
            </div>
          );
        })}

        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-col-reverse items-center gap-3 pt-6 sm:flex-row sm:gap-4">
          <button type="button" onClick={onBack} className="w-full rounded-lg bg-gray-200 py-3.5 text-sm font-semibold text-gray-800 sm:w-36">
            ย้อนกลับ
          </button>
          <button type="submit" className="w-full rounded-lg bg-[#D0021B] py-3.5 text-sm font-bold tracking-wider text-white sm:flex-1">
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
}
