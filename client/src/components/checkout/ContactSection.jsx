import React, { useState } from "react";

export default function ContactSection({
  email,
  onChangeEmail,
  isCollapsed,
  onEdit,
  onContinue,
  onBack,
}) {
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError("กรุณากรอกอีเมลสำหรับติดต่อ");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setError("");
    onContinue();
  };

  if (isCollapsed) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Contact</h2>
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-semibold text-gray-900 underline hover:text-gray-600 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600 font-medium break-all">
          {email || "ยังไม่ได้ระบุอีเมล"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-gray-800 mb-1"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email || ""}
            onChange={(e) => {
              onChangeEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="กรอกอีเมลสำหรับรับข้อมูลการจัดส่ง (เช่น example@mail.com)"
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-100 focus:border-blue-600"
            }`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex items-center gap-4 pt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded transition-colors cursor-pointer"
            >
              ย้อนกลับ
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 bg-[#D0021B] hover:bg-[#b00217] text-white font-bold text-sm tracking-wider uppercase rounded transition-colors shadow-xs cursor-pointer"
          >
            CONTINUE
          </button>
        </div>
      </form>
    </div>
  );
}