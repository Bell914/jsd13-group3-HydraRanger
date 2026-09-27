import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Building2, Clock, QrCode, Wallet } from "lucide-react";

const PLACEHOLDER_PROMPTPAY_ID = "0812345678";
const MERCHANT_NAME = "OCCASION";

const PROMPTPAY_PAYLOAD_ID = String(import.meta.env.VITE_PROMPTPAY_ID || "").trim();

if (import.meta.env.DEV && !PROMPTPAY_PAYLOAD_ID) {
  console.warn(
    `VITE_PROMPTPAY_ID is not set, the checkout QR falls back to the placeholder id ${PLACEHOLDER_PROMPTPAY_ID}.`,
  );
}

function getPromptPayId() {
  return PROMPTPAY_PAYLOAD_ID || PLACEHOLDER_PROMPTPAY_ID;
}

function tlv(id, value) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildMerchantAccount(promptPayId) {
  // Phone and tax-id numbers are zero padded to 15 characters, letter ids are used as they are.
  const account = /^\d+$/.test(promptPayId) ? promptPayId.padStart(15, "0") : promptPayId;
  return `${tlv("00", account)}${tlv("10", "00000")}`;
}

export function buildPromptPayPayload(totalAmount, promptPayId = getPromptPayId()) {
  const amount = (Number(totalAmount) || 0).toFixed(2);
  const body = [
    "000201",
    tlv("01", "11"),
    tlv("29", buildMerchantAccount(promptPayId)),
    tlv("52", "5814"),
    tlv("53", "THB"),
    tlv("54", amount),
    tlv("58", "TH"),
    tlv("59", MERCHANT_NAME),
  ].join("");

  return `${body}6304${crc16(`${body}6304`)}`;
}

export default function PromptPaySection({ totalAmount }) {
  const promptPayId = getPromptPayId();
  const payload = useMemo(() => buildPromptPayPayload(totalAmount, promptPayId), [totalAmount, promptPayId]);
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
          <li className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span>
              ชำระเงินให้ <strong className="text-gray-900">{MERCHANT_NAME}</strong> ผ่านพร้อมเพย์ (PromptPay ID {promptPayId}) ยอดใน QR ถูกกำหนดไว้แล้วและแก้ไขไม่ได้
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
