import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "occasion_cookie_consent";
export const COOKIE_PREFS_EVENT = "occasion:cookie-preferences";

const getStoredDecision = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!getStoredDecision());
    const reopen = () => setShow(true);
    window.addEventListener(COOKIE_PREFS_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, reopen);
  }, []);

  const decide = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore storage access errors */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="คำยินยอมการใช้คุกกี้"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:bottom-5 sm:right-5 sm:w-[26rem]"
    >
      <div className="rounded-2xl border border-occasion-border/40 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Cookie size={20} />
            </span>
            <h2 className="text-base font-bold text-primary">
              เราใช้คุกกี้
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="rounded-full p-1.5 text-secondary transition hover:bg-slate-100 hover:text-primary cursor-pointer"
            aria-label="ปิด"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-secondary">
          เราใช้คุกกี้เพื่อจดจำข้อมูลการใช้งานเว็บไซต์ เช่น สินค้าในตะกร้า
          รายการโปรด และข้อมูลเข้าสู่ระบบ เพื่อมอบประสบการณ์ที่ดีให้กับคุณ
          <Link
            to="/privacy"
            onClick={() => setShow(false)}
            className="ml-0.5 font-semibold text-accent underline hover:text-primary transition"
          >
            อ่านนโยบายความเป็นส่วนตัว
          </Link>
        </p>

        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="flex-1 cursor-pointer rounded-xl border border-occasion-border/60 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-slate-100"
          >
            ปฏิเสธ
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="flex-1 cursor-pointer rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
          >
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;