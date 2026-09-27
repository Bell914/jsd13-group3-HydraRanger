import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, QrCode, Wallet } from "lucide-react";

const PROMPTPAY_PAYLOAD_BASE_URL = "https://occasion.demo/pay";

export function buildPromptPayPayload(totalAmount) {
  const amount = Number(totalAmount) || 0;
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    currency: "THB",
    method: "promptpay",
    demo: "1",
  });
  return `${PROMPTPAY_PAYLOAD_BASE_URL}?${params.toString()}`;
}

export default function PromptPaySection({ totalAmount }) {
  const payload = useMemo(() => buildPromptPayPayload(totalAmount), [totalAmount]);
  const amount = Number(totalAmount || 0);
  const formattedAmount = amount.toLocaleString();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          สแกน QR Code ผ่านแอปพลิเคชันธนาคารเพื่อชำระเงิน
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          เปิดแอปพลิเคชันธนาคารของคุณ เลือกเมนูสแกน QR Code
          แล้วตรวจสอบยอดเงินก่อนกดยืนยันการโอน
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
            aria-label={`QR ชำระเงิน ฿${formattedAmount}`}
          />
        </div>

        <ul className="flex-1 space-y-3 text-xs leading-relaxed text-gray-600">
          <li className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>
              ยอดชำระ <strong className="text-gray-900">฿{formattedAmount}</strong>{" "}
              ครอบคลุมส่วนลดสมาชิก คูปอง และค่าจัดส่งแล้ว
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>
              เมื่อกดยืนยันการชำระเงิน ระบบจะสร้างคำสั่งซื้อและล็อกสต็อกไว้ 30 นาที
              หากยืนยันไม่สำเร็จ คำสั่งซื้อจะถูกยกเลิกและคืนสต็อกให้อัตโนมัติ
            </span>
          </li>
          <li className="flex items-start gap-2">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>โอนเงินตามยอดข้างบนให้เรียบร้อย แล้วกดปุ่มยืนยันการชำระเงินด้านล่างเพื่อสร้างคำสั่งซื้อ</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
