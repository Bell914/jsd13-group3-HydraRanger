import React from "react";
import { Check, CreditCard, QrCode } from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    id: "promptpay",
    name: "PromptPay (Demo)",
    description: "QR ตัวอย่าง ไม่มีการโอนเงินจริง",
    icon: QrCode,
  },
  {
    id: "credit-card",
    name: "Credit / Debit Card (Demo)",
    description: "ใช้เลขบัตรทดสอบ ไม่มีการตัดเงินจริง",
    icon: CreditCard,
  },
];

const SUBMIT_LABELS = {
  idle: "จำลองการชำระเงิน",
  submitting: "กำลังดำเนินการ...",
  cancelling: "กำลังยกเลิกออเดอร์เดิม...",
};

export default function PaymentSection({
  paymentData,
  onChangePayment,
  isSubmitting = false,
  isCancelling = false,
  error,
  onSubmit,
  onBack,
  children,
  isCollapsed,
  onEdit,
}) {
  const selectedMethod = paymentData.method || "promptpay";
  const SelectedPaymentIcon =
    PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.icon || QrCode;
  // Releasing the pending order has to finish before a new payment can be started, so the
  // whole channel stays locked while the cancel is in flight.
  const isBusy = isSubmitting || isCancelling;

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
            {PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.name || "PromptPay"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="text-2xl font-bold text-gray-900">ช่องทางการชำระเงิน</h2>
      <p className="mt-1.5 text-sm text-gray-600">ทั้งสองช่องทางเป็นการจำลอง ไม่มีการโอนหรือตัดเงินจริง</p>

      <ul className="mt-5 space-y-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;
          const OptionIcon = option.icon;

          return (
            <li key={option.id} className="overflow-hidden rounded-xl border border-gray-200">
              <button
                type="button"
                aria-pressed={isSelected}
                aria-expanded={isSelected}
                disabled={isBusy}
                onClick={() => onChangePayment({ method: option.id })}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected ? "bg-[#D0021B] text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <OptionIcon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{option.name}</span>
                    <span className="block text-xs text-gray-500">{option.description}</span>
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isSelected ? "border-[#D0021B] bg-[#D0021B] text-white" : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check size={12} />}
                </span>
              </button>

              {isSelected && children && (
                <div className="border-t border-gray-200 bg-gray-50/60 p-4 sm:p-5">{children}</div>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div
        className={`mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center ${
          onBack ? "sm:justify-between" : "sm:justify-end"
        }`}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isBusy}
            className="w-full rounded-lg bg-gray-200 py-3.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-36"
          >
            ย้อนกลับ
          </button>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={isBusy}
          aria-busy={isBusy}
          className="w-full rounded-lg bg-[#D0021B] py-3.5 text-sm font-bold tracking-wider text-white transition-colors hover:bg-[#b00217] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-72"
        >
          {isCancelling
            ? SUBMIT_LABELS.cancelling
            : isSubmitting
              ? SUBMIT_LABELS.submitting
              : SUBMIT_LABELS.idle}
        </button>
      </div>
    </section>
  );
}
