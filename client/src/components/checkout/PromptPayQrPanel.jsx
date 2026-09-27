import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Info, QrCode, ShieldCheck } from "lucide-react";

const DEMO_PAYMENT_BASE_URL = "https://occasion.demo/pay";

export function buildPromptPayPayload(totalAmount) {
  const amount = Number(totalAmount) || 0;
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    currency: "THB",
    method: "promptpay",
    demo: "1",
  });
  return `${DEMO_PAYMENT_BASE_URL}?${params.toString()}`;
}

export default function PromptPayQrPanel({ totalAmount, isSubmitting, isCancelling, error, onConfirm }) {
  const payload = useMemo(() => buildPromptPayPayload(totalAmount), [totalAmount]);
  // The pending order still holds stock until its cancel lands, so paying has to wait.
  const isBusy = isSubmitting || isCancelling;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="mb-1 text-xl font-bold text-gray-900">QR สำหรับสาธิตขั้นตอนชำระเงิน</h2>
      <p className="mb-5 text-sm text-gray-600">
        QR ด้านล่างสร้างขึ้นจริงและสแกนได้ แต่ไม่ใช่ QR ของธนาคารหรือพร้อมเพย์
        จึงใช้สาธิตลำดับการชำระเงินเท่านั้น ยอดชำระ ฿{Number(totalAmount || 0).toLocaleString()}
      </p>

      <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
        <p className="flex items-start gap-2 font-semibold">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>ระบบชำระเงินจำลองสำหรับงานสาธิต</span>
        </p>
        <p className="mt-1 pl-6 text-xs leading-relaxed">
          QR นี้ไม่เชื่อมต่อธนาคารและไม่มีการตัดเงินจริง
          แอปธนาคารจะไม่สามารถใช้จ่ายเงินผ่าน QR นี้ได้ กดปุ่มด้านล่างเพื่อจำลองการโอนสำเร็จ
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-xs">
          <QRCodeSVG
            value={payload}
            size={176}
            level="M"
            marginSize={0}
            role="img"
            aria-label={`QR สำหรับสาธิต ${Number(totalAmount || 0).toLocaleString()} บาท`}
          />
        </div>

        <div className="flex-1 space-y-3 text-sm">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              ยอดชำระ <strong className="text-gray-900">฿{Number(totalAmount || 0).toLocaleString()}</strong>{" "}
              ครอบคลุมส่วนลดสมาชิก คูปอง และค่าจัดส่งแล้ว
            </span>
          </p>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>คำสั่งซื้อจะถูกยกเลิกและคืนสต็อกอัตโนมัติ หากไม่ยืนยันภายใน 30 นาที</span>
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={isBusy}
        aria-busy={isBusy}
        className="mt-5 w-full rounded-lg bg-[#D0021B] py-3.5 text-sm font-bold tracking-wider text-white transition-colors hover:bg-[#b00217] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCancelling
          ? "กำลังยกเลิกออเดอร์เดิม..."
          : isSubmitting
            ? "กำลังยืนยันการโอนเงิน..."
            : "จำลองการโอนเงินสำเร็จ"}
      </button>
    </div>
  );
}
