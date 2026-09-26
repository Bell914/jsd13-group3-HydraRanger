import React, { useState } from 'react';
import {
  Ticket,
  Clock,
  Dices,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

const asDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const getExpiryDateObject = (dateStr) => {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatPreviewDate = (value) => {
  if (!value) return '-';
  const d = getExpiryDateObject(value);
  if (!d || Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
};

export function CouponFormModal({ coupon, saving, onClose, onSave }) {
  const isEditing = Boolean(coupon?._id);

  const [form, setForm] = useState(() => ({
    code: coupon?.code || '',
    eventName: coupon?.eventName || '',
    discountValue: coupon?.discountValue ?? 10,
    minPurchase: coupon?.minPurchase ?? 0,
    expiresAt: coupon?.expiresAt ? asDateInput(coupon.expiresAt) : '',
    isActive: coupon?.isActive ?? true
  }));

  const [validationError, setValidationError] = useState('');

  // Auto-uppercase and clean code
  const handleCodeChange = (e) => {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setForm((prev) => ({ ...prev, code: clean }));
    setValidationError('');
  };

  const handleRandomCode = () => {
    const prefixes = ['OCC', 'FLASH', 'SALE', 'VIP', 'PROMO'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const chars = Math.random().toString(36).substring(2, 5).toUpperCase();
    setForm((prev) => ({ ...prev, code: `${p}${num}${chars}` }));
    setValidationError('');
  };

  const setQuickExpiryDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setForm((prev) => ({ ...prev, expiresAt: asDateInput(d) }));
    setValidationError('');
  };

  const setQuickExpiryEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setForm((prev) => ({ ...prev, expiresAt: asDateInput(lastDay) }));
    setValidationError('');
  };

  const setQuickExpiryEndOfYear = () => {
    const now = new Date();
    const endYear = new Date(now.getFullYear(), 11, 31);
    setForm((prev) => ({ ...prev, expiresAt: asDateInput(endYear) }));
    setValidationError('');
  };

  const expiryDateObj = getExpiryDateObject(form.expiresAt);
  const isExpired = expiryDateObj ? expiryDateObj.getTime() < Date.now() : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      setValidationError('กรุณาระบุรหัสคูปอง');
      return;
    }
    if (!form.expiresAt) {
      setValidationError('กรุณาระบุวันหมดอายุ');
      return;
    }
    const expiryDate = getExpiryDateObject(form.expiresAt);
    if (!expiryDate || expiryDate.getTime() < Date.now()) {
      setValidationError('วันหมดอายุต้องเป็นวันปัจจุบันหรือวันในอนาคต');
      return;
    }

    onSave({
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: Number(form.discountValue),
      minPurchase: Number(form.minPurchase),
      expiresAt: expiryDate.toISOString()
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-[#e2156d]">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                COUPON MANAGEMENT
              </p>
              <h2 id="coupon-modal-title" className="text-base font-bold text-stone-900 leading-tight">
                {isEditing ? 'แก้ไขคูปองส่วนลด' : 'เพิ่มคูปองส่วนลดใหม่'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Live Preview Ticket Card */}
          <div className="rounded-xl border border-dashed border-stone-300 bg-gradient-to-r from-stone-50 via-white to-pink-50/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#e2156d] block truncate">
                  {form.eventName || 'PROMOTION VOUCHER'}
                </span>
                <span className="font-mono text-xl font-extrabold tracking-wider text-[#0046a7] block truncate">
                  {form.code || 'COUPON_CODE'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block rounded-full bg-[#e2156d] px-3 py-1 text-xs font-bold text-white shadow-xs">
                  ลด {form.discountValue || 0}%
                </span>
                <p className="text-[11px] text-stone-500 mt-1">
                  {form.minPurchase > 0 ? `ขั้นต่ำ ฿${Number(form.minPurchase).toLocaleString()}` : 'ไม่มีขั้นต่ำ'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-stone-200/80 pt-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5 truncate">
                <Clock size={13} className="text-stone-400 shrink-0" />
                {form.expiresAt ? (
                  <span>หมดอายุ <strong>{formatPreviewDate(form.expiresAt)}</strong></span>
                ) : (
                  <span className="italic text-stone-400">ยังไม่กำหนดวันหมดอายุ</span>
                )}
              </span>
              <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                form.isActive && !isExpired
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-stone-100 text-stone-500'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${form.isActive && !isExpired ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                {isExpired ? 'หมดอายุ' : form.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field: Coupon Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between min-h-[22px]">
                <label className="text-xs font-bold text-stone-700">
                  รหัสคูปอง
                </label>
                <button
                  type="button"
                  onClick={handleRandomCode}
                  className="text-xs font-semibold text-[#e2156d] hover:text-[#b81159] flex items-center gap-1 transition cursor-pointer"
                  title="สุ่มรหัสอัตโนมัติ"
                >
                  <Dices size={13} />
                  <span>สุ่มรหัส</span>
                </button>
              </div>
              <input
                name="code"
                value={form.code}
                onChange={handleCodeChange}
                maxLength={32}
                required
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-bold tracking-wide uppercase text-stone-900 focus:border-[#e2156d] focus:ring-1 focus:ring-[#e2156d] outline-none"
              />
            </div>

            {/* Field: Campaign Name */}
            <div className="space-y-1">
              <div className="flex items-center min-h-[22px]">
                <label className="text-xs font-bold text-stone-700">
                  ชื่อแคมเปญ / อีเวนต์
                </label>
              </div>
              <input
                name="eventName"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                maxLength={100}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#e2156d] focus:ring-1 focus:ring-[#e2156d] outline-none"
              />
            </div>

            {/* Field: Discount */}
            <div className="space-y-1">
              <div className="flex items-center min-h-[22px]">
                <label className="text-xs font-bold text-stone-700">
                  ส่วนลด
                </label>
              </div>
              <div className="relative">
                <input
                  name="discountValue"
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: Math.min(100, Math.max(1, Number(e.target.value) || 0)) })
                  }
                  required
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pr-7 text-sm font-bold text-stone-900 focus:border-[#e2156d] focus:ring-1 focus:ring-[#e2156d] outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  %
                </span>
              </div>
              {/* Presets */}
              <div className="flex gap-1 pt-1">
                {[5, 10, 15, 20, 30, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, discountValue: val }))}
                    className={`flex-1 py-1 rounded text-[11px] font-bold border transition ${
                      form.discountValue === val
                        ? 'bg-[#e2156d] text-white border-[#e2156d]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Min Purchase */}
            <div className="space-y-1">
              <div className="flex items-center min-h-[22px]">
                <label className="text-xs font-bold text-stone-700">
                  ยอดซื้อขั้นต่ำ
                </label>
              </div>
              <div className="relative">
                <input
                  name="minPurchase"
                  type="number"
                  min="0"
                  value={form.minPurchase}
                  onChange={(e) =>
                    setForm({ ...form, minPurchase: Math.max(0, Number(e.target.value) || 0) })
                  }
                  required
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pr-8 text-sm font-bold text-stone-900 focus:border-[#e2156d] focus:ring-1 focus:ring-[#e2156d] outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                  ฿
                </span>
              </div>
              {/* Presets */}
              <div className="flex gap-1 pt-1">
                {[
                  { label: '฿0', val: 0 },
                  { label: '฿500', val: 500 },
                  { label: '฿800', val: 800 },
                  { label: '฿1k', val: 1000 },
                  { label: '฿2k', val: 2000 }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, minPurchase: item.val }))}
                    className={`flex-1 py-1 rounded text-[11px] font-bold border transition ${
                      form.minPurchase === item.val
                        ? 'bg-[#0046a7] text-white border-[#0046a7]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Expiration Date */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between min-h-[22px]">
                <label className="text-xs font-bold text-stone-700">
                  วันหมดอายุ
                </label>
                {isExpired && (
                  <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>วันหมดอายุอยู่ในอดีต</span>
                  </span>
                )}
              </div>
              <input
                name="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => {
                  setForm({ ...form, expiresAt: e.target.value });
                  setValidationError('');
                }}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-stone-900 outline-none ${
                  isExpired
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-stone-300 bg-white focus:border-[#e2156d] focus:ring-1 focus:ring-[#e2156d]'
                }`}
              />
              {/* Expiry Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '+7 วัน', fn: () => setQuickExpiryDays(7) },
                  { label: '+14 วัน', fn: () => setQuickExpiryDays(14) },
                  { label: '+30 วัน', fn: () => setQuickExpiryDays(30) },
                  { label: 'สิ้นเดือนนี้', fn: setQuickExpiryEndOfMonth },
                  { label: `สิ้นปี ${currentYear}`, fn: setQuickExpiryEndOfYear }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.fn}
                    className="px-2.5 py-1 rounded text-[11px] font-medium border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-200 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Toggle Active */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50">
              <div>
                <p className="text-xs font-bold text-stone-800 m-0">เปิดให้ลูกค้าใช้งานคูปองทันที</p>
                <p className="text-[11px] text-stone-500 m-0">ลูกค้าสามารถนำโค้ดไปกรอกเพื่อรับส่วนลดได้ทันที</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-[#e2156d]' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {validationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#e2156d] hover:bg-[#b81159] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              <span>{isEditing ? 'อัปเดตคูปอง' : 'บันทึกคูปอง'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
