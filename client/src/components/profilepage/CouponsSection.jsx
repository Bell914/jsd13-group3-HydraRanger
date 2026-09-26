import React, { useState, useRef, useEffect } from 'react';
import { Ticket, Copy, Check, Cake, Crown, Gift, Tag, ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCouponsForUser, getRankTheme } from '../../utils/loyaltyUtils.js';

export const CouponsSection = ({ user }) => {
  const currentRank = user?.membership?.rank || 'MEMBER';
  const theme = getRankTheme(currentRank);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedBirthMonth, setSelectedBirthMonth] = useState(() => {
    const profileBirthday = user?.birthday ? new Date(user.birthday) : null;
    if (profileBirthday && !Number.isNaN(profileBirthday.getTime())) {
      return profileBirthday.getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  });
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setIsMonthPickerOpen(false);
      }
    };
    if (isMonthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthPickerOpen]);

  const profileBirthday = user?.birthday ? new Date(user.birthday) : null;
  const coupons = getCouponsForUser(currentRank, selectedBirthMonth);

  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span>คูปองและสิทธิพิเศษของฉัน</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            รวมคูปองส่วนลดและสิทธิพิเศษที่คุณสามารถคัดลอกไปใช้ในหน้าชำระเงินได้ทันที
          </p>
        </div>

        {/* Current Tier Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <span>ระดับของคุณ <strong className="text-primary">{currentRank}</strong></span>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copiedCode && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>คัดลอกโค้ด <strong>{copiedCode}</strong> สำเร็จ! นำไปวางในช่อง Gift Card / โค้ดส่วนลดที่หน้าชำระเงินได้เลย</span>
          </div>
          <Link
            to="/checkout"
            className="inline-flex items-center gap-1 text-emerald-900 font-bold underline hover:text-emerald-950 shrink-0"
          >
            <span>ไปที่ Checkout</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Birthday Reward Configurator (Item 12) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>สิทธิ์ส่วนลดเดือนเกิด</span>
                <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 text-[10px] font-extrabold uppercase">
                  {currentRank === 'PLATINUM' ? 'ลด 25% + Gift Set' : currentRank === 'GOLD' ? 'ลด 20%' : currentRank === 'SILVER' ? 'ลด 15%' : currentRank === 'BRONZE' ? 'ลด 10%' : 'ลด 5%'}
                </span>
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                รับส่วนลดพิเศษ 1 ครั้งในเดือนเกิดของคุณตามระดับสมาชิกปัจจุบัน
              </p>
              {profileBirthday && (
                <p className="text-[11px] text-pink-700 font-semibold mt-1">
                  มาจากวันเกิดในโปรไฟล์{' '}
                  {profileBirthday.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5" ref={monthPickerRef}>
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
              เดือนเกิด
            </span>
            <div className="relative">
              <button
                type="button"
                id="birth-month"
                aria-haspopup="listbox"
                aria-expanded={isMonthPickerOpen}
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-pink-200/90 bg-white hover:bg-pink-50/50 text-xs font-bold text-gray-800 shadow-2xs hover:border-pink-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400/40"
              >
                <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{months[selectedBirthMonth - 1]}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    isMonthPickerOpen ? 'rotate-180 text-pink-500' : ''
                  }`}
                />
              </button>

              {isMonthPickerOpen && (
                <div
                  role="listbox"
                  aria-label="เลือกเดือนเกิด"
                  className="absolute right-0 top-full mt-2 w-72 p-2.5 rounded-2xl bg-white border border-stone-200 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2 py-1 mb-1.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500">เลือกเดือนเกิด</span>
                    <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full">
                      {months[selectedBirthMonth - 1]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {months.map((m, idx) => {
                      const isSelected = selectedBirthMonth === idx + 1;
                      const isCurrentMonth = new Date().getMonth() === idx;
                      return (
                        <button
                          key={idx + 1}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedBirthMonth(idx + 1);
                            setIsMonthPickerOpen(false);
                          }}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-pink-500 text-white shadow-xs font-extrabold scale-[1.02]'
                              : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                          }`}
                        >
                          <span>{m}</span>
                          {isCurrentMonth && (
                            <span className={`text-[9px] mt-0.5 font-normal ${isSelected ? 'text-pink-100' : 'text-pink-500'}`}>
                              เดือนนี้
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Grid (Item 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
              coupon.usable
                ? 'bg-white border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-md'
                : 'bg-gray-50 border-gray-200 opacity-75'
            }`}
          >
            {/* Top Row: Badge & Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                  <Tag size={12} />
                  <span>{coupon.badge}</span>
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  หมดอายุ {coupon.expiresAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mt-1">
                {coupon.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {coupon.discountType === 'percent'
                  ? `ส่วนลด ${coupon.discountValue}% ${coupon.minSpend > 0 ? `เมื่อซื้อขั้นต่ำ ฿${coupon.minSpend}` : 'ไม่มีขั้นต่ำ'}`
                  : 'คูปองยกเว้นค่าจัดส่งทุกประเภท'}
              </p>
            </div>

            {/* Coupon Code Strip */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-xs font-bold text-gray-800 tracking-wider">
                <span>{coupon.code}</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(coupon.code)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  copiedCode === coupon.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-white hover:bg-primary-hover shadow-2xs'
                }`}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check size={13} />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>คัดลอกโค้ด</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponsSection;
