import React, { useState } from 'react';
import { Crown, Sparkles, Award, Shield, Medal, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import {
  calculateProgress,
  getRankTheme,
  RANK_BENEFITS,
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  NEXT_RANK_PERKS
} from '../../utils/loyaltyUtils.js';

export const MembershipCard = ({ user }) => {
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const spending = Number(user?.membership?.accumulatedSpending || 0);
  const progress = calculateProgress(spending);
  const currentRank = user?.membership?.rank || progress.currentRank;
  const theme = getRankTheme(currentRank);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'PLATINUM':
        return <Award size={20} className="text-purple-300" />;
      case 'GOLD':
        return <Crown size={20} className="text-amber-300" />;
      case 'SILVER':
        return <Sparkles size={20} className="text-slate-200" />;
      case 'BRONZE':
        return <Medal size={20} className="text-amber-500" />;
      default:
        return <Shield size={20} className="text-blue-300" />;
    }
  };

  const discountPercent = RANK_DISCOUNT_PERCENT[currentRank] || 0;
  const freeShipping = FREE_SHIPPING_MINIMUM[currentRank] === 0;

  return (
    <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${theme.cardGradient} border ${theme.cardBorder} p-6 text-white shadow-xl mb-6 relative`}>
      {/* Decorative ambient blur */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
            OCCASION LOYALTY CLUB
          </span>
          <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{user?.username || 'Customer'}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 mt-0.5">
            <span>{theme.labelTh}</span>
            <span>•</span>
            <span className="font-mono font-medium text-amber-200/90">
              Member ID: {user?._id ? `OCC-${String(user._id).slice(-6).toUpperCase()}` : (user?.memberId || 'OCC-M88219')}
            </span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.badgeBg} text-xs font-black tracking-wider uppercase shadow-inner`}>
          {getRankIcon(currentRank)}
          <span>{currentRank}</span>
        </div>
      </div>

      {/* Spending & Progress */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-baseline justify-between text-sm mb-2">
          <span className="text-xs font-semibold text-white/75">ยอดซื้อสะสม:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-white">
              ฿{spending.toLocaleString()}
            </span>
            <span className="text-xs text-white/60">บาท</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/40 p-0.5">
          <div
            className={`h-full rounded-full ${theme.barColor} transition-all duration-700`}
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>

        {/* Next Tier Milestone Note */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {progress.isMaxRank ? (
            <span className="font-semibold text-purple-300">
              ✦ คุณอยู่ในระดับสูงสุด (PLATINUM) เรียบร้อยแล้ว
            </span>
          ) : (
            <span className="text-white/80">
              ช้อปอีก <strong className="text-amber-200">฿{progress.amountNeeded.toLocaleString()}</strong> เพื่อปลดล็อกระดับ <strong className="underline">{progress.nextRank}</strong>
            </span>
          )}
          <span className="font-bold text-white/60">{progress.progressPercentage}%</span>
        </div>

        {/* Next Rank Benefits Preview (Item 6) */}
        {!progress.isMaxRank && NEXT_RANK_PERKS[currentRank] && (
          <div className="mt-3.5 rounded-xl bg-black/25 p-3.5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
              <Sparkles size={14} className="text-amber-300" />
              <span>สิทธิประโยชน์ที่จะได้รับเมื่อเลื่อนเป็น {progress.nextRank}:</span>
            </div>
            <ul className="space-y-1 text-xs text-white/90">
              {NEXT_RANK_PERKS[currentRank].highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Key Highlights */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/5 backdrop-blur-xs">
          <span className="text-[10px] text-white/60 block font-medium">ส่วนลดประจำ Rank</span>
          <span className="text-sm font-extrabold text-amber-200">
            {discountPercent > 0 ? `ลดเพิ่ม ${discountPercent}%` : 'ไม่มีส่วนลด'}
          </span>
        </div>
        <div className="rounded-xl bg-white/5 p-2.5 border border-white/5 backdrop-blur-xs">
          <span className="text-[10px] text-white/60 block font-medium">สิทธิ์ส่งฟรี</span>
          <span className="text-sm font-extrabold text-white">
            {freeShipping ? 'ส่งฟรีทุกออเดอร์' : `ส่งฟรีครบ ฿${FREE_SHIPPING_MINIMUM[currentRank]}`}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-white/5 p-2.5 border border-white/5 backdrop-blur-xs">
          <span className="text-[10px] text-white/60 block font-medium">สิทธิ์วันเกิด</span>
          <span className="text-sm font-extrabold text-white">
            {currentRank === 'PLATINUM' ? 'ลด 25% + Gift' : currentRank === 'GOLD' ? 'ลด 20%' : currentRank === 'SILVER' ? 'ลด 15%' : currentRank === 'BRONZE' ? 'ลด 10%' : 'ลด 5%'}
          </span>
        </div>
      </div>

      {/* Expandable Benefits List */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={() => setShowAllBenefits(!showAllBenefits)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 hover:text-white transition cursor-pointer"
        >
          <span>{showAllBenefits ? 'ซ่อนสิทธิประโยชน์' : 'ดูสิทธิประโยชน์ทั้งหมดของระดับนี้'}</span>
          {showAllBenefits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAllBenefits && (
          <ul className="mt-3 space-y-1.5 rounded-xl bg-black/25 p-3.5 border border-white/5 text-xs text-white/90">
            {(RANK_BENEFITS[currentRank] || []).map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MembershipCard;
