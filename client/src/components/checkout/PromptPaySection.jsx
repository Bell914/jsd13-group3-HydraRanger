import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, QrCode, Wallet } from "lucide-react";

// This is intentionally not an EMV PromptPay payload, so scanning it cannot initiate a transfer.
export function buildDemoQrPayload(totalAmount) {
  return `OCCASION-DEMO|amount=${(Number(totalAmount) || 0).toFixed(2)}|currency=THB`;
}

export default function PromptPaySection({ totalAmount }) {
  const payload = useMemo(() => buildDemoQrPayload(totalAmount), [totalAmount]);
  const amount = Number(totalAmount || 0);
  const formattedAmount = amount.toLocaleString();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">PromptPay QR ตัวอย่างสำหรับ Demo</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          QR นี้แสดงยอดตัวอย่างและไม่ใช่ QR สำหรับโอนเงิน กดปุ่มด้านล่างเพื่อจำลองผลการชำระเงิน
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-start">
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
          <QRCodeSVG
            value={payload}
            size={168}
            level="M"
            marginSize={0}
            role="img"
            aria-label={`QR Demo ยอด ฿${formattedAmount} ไม่ใช่ QR สำหรับชำระเงินจริง`}
          />
        </div>

        <ul className="flex-1 space-y-3 text-xs leading-relaxed text-gray-600">
          <li className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>ยอดตัวอย่าง <strong className="text-gray-900">฿{formattedAmount}</strong> รวมส่วนลดและค่าจัดส่งแล้ว</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>ระบบจะสร้างคำสั่งซื้อและจำลองการชำระเงินทันทีเมื่อกดปุ่ม โดยไม่มีการโอนเงินจริง</span>
          </li>
          <li className="flex items-start gap-2">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>ไม่มีการเชื่อมต่อธนาคารหรือเรียกเก็บเงินจริง</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
