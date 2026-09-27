import React, { forwardRef, useImperativeHandle, useState } from "react";
import { CreditCard, Lock } from "lucide-react";

export const ACCEPTED_CARD_NUMBER = "4242424242424242";

function passesLuhnCheck(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateCardDetails({ cardNumber, cardholderName, expiry, cvc }) {
  const digits = cardNumber.replace(/\s/g, "");
  const errors = {};

  if (!/^\d{13,19}$/.test(digits)) {
    errors.cardNumber = "กรุณากรอกหมายเลขบัตร 13-19 หลัก";
  } else if (!passesLuhnCheck(digits)) {
    errors.cardNumber = "หมายเลขบัตรไม่ถูกต้อง";
  } else if (digits !== ACCEPTED_CARD_NUMBER) {
    // The form must never take a real card number, so only the published number passes.
    errors.cardNumber = `กรุณากรอกหมายเลขบัตร ${formatCardNumber(ACCEPTED_CARD_NUMBER)}`;
  }

  if (!cardholderName.trim()) {
    errors.cardholderName = "กรุณากรอกชื่อผู้ถือบัตร";
  }

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!expiryMatch) {
    errors.expiry = "กรุณากรอกวันหมดอายุเป็นรูปแบบ MM/YY";
  } else {
    const month = Number(expiryMatch[1]);
    const year = 2000 + Number(expiryMatch[2]);
    if (month < 1 || month > 12) {
      errors.expiry = "เดือนไม่ถูกต้อง";
    } else {
      const expiresAt = new Date(year, month, 0, 23, 59, 59);
      if (expiresAt.getTime() < Date.now()) {
        errors.expiry = "บัตรหมดอายุแล้ว";
      }
    }
  }

  if (!/^\d{3,4}$/.test(cvc)) {
    errors.cvc = "กรุณากรอก CVC 3-4 หลัก";
  }

  return errors;
}

const inputClassName = (hasError) =>
  `w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
  }`;

// The primary pay button lives at the bottom of PaymentSection, so the fields own their
// validation and expose it to the page, which only creates the order once every field is valid.
const CreditCardForm = forwardRef(function CreditCardForm({ onPay, isBusy = false }, ref) {
  const [card, setCard] = useState({
    cardNumber: "",
    cardholderName: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({ validate: validateCard }), [validateCard]);

  function updateField(field, value) {
    setCard((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function validateCard() {
    const nextErrors = validateCardDetails(card);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleKeyDown(keyEvent) {
    if (keyEvent.key !== "Enter" || isBusy) return;
    keyEvent.preventDefault();
    if (validateCard()) onPay?.();
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <div>
        <h3 className="text-sm font-bold text-gray-900">          กรอกข้อมูลบัตรเครดิต / เดบิต อย่างปลอดภัย
</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          ใช้หมายเลขบัตร{" "}
          <span className="font-mono font-semibold text-gray-900">
            {formatCardNumber(ACCEPTED_CARD_NUMBER)}
          </span>{" "}
          วันหมดอายุใดก็ได้ในอนาคต และ CVC 3 หลัก
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label htmlFor="card-number" className="mb-1 block text-sm font-medium text-gray-800">
            หมายเลขบัตร
          </label>
          <div className="relative">
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              name="card-number"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              value={card.cardNumber}
              onChange={(event) => updateField("cardNumber", formatCardNumber(event.target.value))}
              placeholder="4242 4242 4242 4242"
              aria-invalid={Boolean(errors.cardNumber)}
              className={`${inputClassName(errors.cardNumber)} pr-10 font-mono`}
            />
            <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
          {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
        </div>

        <div>
          <label htmlFor="cardholder-name" className="mb-1 block text-sm font-medium text-gray-800">
            ชื่อผู้ถือบัตร
          </label>
          <input
            id="cardholder-name"
            type="text"
            name="cardholder-name"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            value={card.cardholderName}
            onChange={(event) => updateField("cardholderName", event.target.value)}
            placeholder="SOMCHAI JAIDEE"
            aria-invalid={Boolean(errors.cardholderName)}
            className={inputClassName(errors.cardholderName)}
          />
          {errors.cardholderName && <p className="mt-1 text-xs text-red-500">{errors.cardholderName}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="card-expiry" className="mb-1 block text-sm font-medium text-gray-800">
              วันหมดอายุ (MM/YY)
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              name="card-expiry"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              value={card.expiry}
              onChange={(event) => updateField("expiry", formatExpiry(event.target.value))}
              placeholder="12/30"
              aria-invalid={Boolean(errors.expiry)}
              className={`${inputClassName(errors.expiry)} font-mono`}
            />
            {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
          </div>

          <div>
            <label htmlFor="card-cvc" className="mb-1 block text-sm font-medium text-gray-800">
              CVC
            </label>
            <input
              id="card-cvc"
              type="text"
              inputMode="numeric"
              name="card-cvc"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              value={card.cvc}
              onChange={(event) => updateField("cvc", event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              aria-invalid={Boolean(errors.cvc)}
              className={`${inputClassName(errors.cvc)} font-mono`}
            />
            {errors.cvc && <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>}
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-600">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>ข้อมูลบัตรของคุณไม่ถูกส่งออกไปยังเซิร์ฟเวอร์หรือบันทึกไว้ในระบบ</span>
        </p>
      </div>
    </div>
  );
});

export default CreditCardForm;
