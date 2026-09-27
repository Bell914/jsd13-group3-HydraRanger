import React from "react";
import { CreditCard, Plus, QrCode } from "lucide-react";

const PAYMENT_OPTIONS = [
  { id: "promptpay", name: "PromptPay", icon: QrCode },
  { id: "credit-card", name: "Credit / Debit Card", icon: CreditCard },
];

export default function PaymentSection({
  paymentData,
  onChangePayment,
  isCancelling,
  isCollapsed,
  onEdit,
  onBack,
}) {
  const selectedMethod = paymentData.method || "promptpay";
  const SelectedPaymentIcon =
    PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.icon || QrCode;

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
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">ช่องทางการชำระเงิน</h2>
      <p className="mb-6 text-sm text-gray-600">
        เลือกช่องทางที่ต้องการ แล้วกรอกข้อมูลในขั้นตอนถัดไปเพื่อยืนยันคำสั่งซื้อ
      </p>

      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;

          return (
            <div key={option.id} className="overflow-hidden rounded-lg border border-gray-200">
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={isCancelling}
                onClick={() => onChangePayment({ method: option.id })}
                className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <option.icon size={20} aria-hidden="true" />
                  <span className="text-sm font-semibold">{option.name}</span>
                </span>
                <Plus className={`h-4 w-4 transition-transform ${isSelected ? "rotate-45" : ""}`} />
              </button>
              {isSelected && (
                <p className="border-t bg-gray-50 p-4 text-sm text-gray-600">
                  {option.id === "promptpay"
                    ? "ดู QR สำหรับสาธิตด้านล่าง แล้วกดยืนยันการโอน (QR นี้ไม่เชื่อมต่อธนาคาร)"
                    : "กรอกเฉพาะหมายเลขบัตรทดสอบด้านล่าง แล้วกดปุ่มชำระเงินเพื่อยืนยันคำสั่งซื้อ"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        ทั้งสองช่องทางเป็นระบบชำระเงินจำลองสำหรับงานสาธิต ระบบจะไม่ตัดเงินจริงจากบัญชีของคุณ
        และ QR ที่แสดงไม่ใช่ QR ของธนาคารหรือพร้อมเพย์
        {isCancelling && " กำลังยกเลิกออเดอร์เดิม กรุณารอสักครู่"}
      </p>

      {onBack && (
        <div className="pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isCancelling}
            className="w-full rounded-lg bg-gray-200 py-3.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-36"
          >
            ย้อนกลับ
          </button>
        </div>
      )}
    </div>
  );
}
