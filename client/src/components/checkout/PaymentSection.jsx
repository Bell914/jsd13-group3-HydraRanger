import React, { useState } from "react";
import { CreditCard, Plus, QrCode, Wallet } from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "promptpay", name: "PromptPay", icon: QrCode },
  { id: "paypal", name: "PayPal", icon: Wallet },
  { id: "credit-card", name: "Credit / Debit Card", icon: CreditCard },
];

export default function PaymentSection({
  paymentData,
  onChangePayment,
  isCollapsed,
  onEdit,
  onContinue,
  onBack,
}) {
  const selectedMethod = paymentData.method || "credit-card";
  const SelectedPaymentIcon = PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.icon || CreditCard;
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (selectedMethod === "credit-card" && !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setError("ระบบชำระเงินยังไม่ได้ตั้งค่า Stripe");
      return;
    }

    onChangePayment({ method: selectedMethod });
    onContinue();
  }

  if (isCollapsed) {
    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">ช่องทางการชำระเงิน</h2>
          {onEdit && (
            <button type="button" onClick={onEdit} className="text-sm font-semibold underline">
              แก้ไข
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SelectedPaymentIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            {PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.name || "Credit / Debit Card"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">ช่องทางการชำระเงิน</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <div key={option.id} className="overflow-hidden rounded-lg border border-gray-200">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setError("");
                  onChangePayment({ method: option.id });
                }}
                className={`flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 ${isSelected ? "bg-gray-50" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <option.icon size={20} aria-hidden="true" />
                  <span className="text-sm font-semibold">{option.name}</span>
                </span>
                <Plus className={`h-4 w-4 transition-transform ${isSelected ? "rotate-45" : ""}`} />
              </button>
              {isSelected && option.id === "credit-card" && (
                <p className="border-t bg-gray-50 p-4 text-sm text-gray-600">
                  กรอกข้อมูลบัตรอย่างปลอดภัยผ่าน Stripe ในขั้นตอนถัดไป
                </p>
              )}
              {isSelected && option.id === "promptpay" && (
                <div className="flex items-center gap-4 border-t bg-gray-50 p-4">
                  <div aria-label="QR Code จำลองสำหรับเดโม" className="grid h-20 w-20 grid-cols-5 gap-0.5 rounded bg-white p-1 ring-1 ring-gray-200">
                    {[1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1].map((pixel, index) => (
                      <span key={index} className={pixel ? "bg-gray-900" : "bg-white"} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    QR Code จำลองสำหรับเดโมเท่านั้น<br />ไม่มีการรับชำระเงินจริง
                  </p>
                </div>
              )}
              {isSelected && option.id === "paypal" && (
                <p className="border-t bg-gray-50 p-4 text-sm text-gray-600">
                  PayPal (โหมดทดสอบระบบ - ไม่มีการตัดเงินจริง)
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
            ดำเนินการต่อ
          </button>
        </div>
      </form>
    </div>
  );
}
