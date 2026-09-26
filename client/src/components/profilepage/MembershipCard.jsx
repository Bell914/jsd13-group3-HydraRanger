import React, { useState } from 'react';
import { Crown, Gem, Gift, Award, Shield, Medal, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
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
        return <Award size={20} className="text-accent" />;
      case 'GOLD':
        return <Crown size={20} className="text-accent" />;
      case 'SILVER':
        return <Gem size={20} className="text-accent" />;
      case 'BRONZE':
        return <Medal size={20} className="text-accent" />;
      default:
        return <Shield size={20} className="text-accent" />;
    }
  };

  const discountPercent = RANK_DISCOUNT_PERCENT[currentRank] || 0;
  const freeShipping = FREE_SHIPPING_MINIMUM[currentRank] === 0;

  return (
    <div className="rounded-2xl border border-occasion-border/70 p-6 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary/60">
            OCCASION LOYALTY CLUB
          </span>
          <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-primary flex items-center gap-2">
            <span>{user?.username || 'Customer'}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
            <span>{theme.labelTh}</span>
            <span>•</span>
            <span className="font-mono font-medium text-accent">
              Member ID {user?._id ? `OCC-${String(user._id).slice(-6).toUpperCase()}` : (user?.memberId || 'OCC-M88219')}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/15 px-3.5 py-1.5 text-xs font-black tracking-wider uppercase text-accent">
          {getRankIcon(currentRank)}
          <span>{currentRank}</span>
        </div>
      </div>

      {/* Spending & Progress */}
      <div className="mt-6 pt-5 border-t border-occasion-border/60">
        <div className="flex items-baseline justify-between text-sm mb-2">
          <span className="text-xs font-semibold text-muted">ยอดซื้อสะสม</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-primary">
              ฿{spending.toLocaleString()}
            </span>
            <span className="text-xs text-muted">บาท</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-primary/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-[#ff7ab1] transition-all duration-700"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>

        {/* Next Tier Milestone Note */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {progress.isMaxRank ? (
            <span className="font-semibold text-accent">
              ✦ คุณอยู่ในระดับสูงสุด PLATINUM เรียบร้อยแล้ว
            </span>
          ) : (
            <span className="text-muted">
              ช้อปอีก <strong className="font-bold text-accent">฿{progress.amountNeeded.toLocaleString()}</strong> เพื่อปลดล็อกระดับ <strong className="font-bold text-primary underline">{progress.nextRank}</strong>
            </span>
          )}
          <span className="font-bold text-accent">{progress.progressPercentage}%</span>
        </div>

        {/* Next Rank Benefits Preview (Item 6) */}
        {!progress.isMaxRank && NEXT_RANK_PERKS[currentRank] && (
          <div className="mt-3.5 rounded-xl border border-occasion-border bg-primary/5 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent mb-1.5">
              <Gift size={14} className="text-accent" />
              <span>สิทธิประโยชน์ที่จะได้รับเมื่อเลื่อนเป็น {progress.nextRank}</span>
            </div>
            <ul className="space-y-1 text-xs text-muted">
              {NEXT_RANK_PERKS[currentRank].highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Key Highlights */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-occasion-border/60">
        <div className="rounded-xl border border-occasion-border bg-primary/5 p-2.5">
          <span className="text-[10px] text-muted block font-medium">ส่วนลดประจำ Rank</span>
          <span className="text-sm font-extrabold text-accent">
            {discountPercent > 0 ? `ลดเพิ่ม ${discountPercent}%` : 'ไม่มีส่วนลด'}
          </span>
        </div>
        <div className="rounded-xl border border-occasion-border bg-primary/5 p-2.5">
          <span className="text-[10px] text-muted block font-medium">สิทธิ์ส่งฟรี</span>
          <span className="text-sm font-extrabold text-primary">
            {freeShipping ? 'ส่งฟรีทุกออเดอร์' : `ส่งฟรีครบ ฿${FREE_SHIPPING_MINIMUM[currentRank]}`}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-occasion-border bg-primary/5 p-2.5">
          <span className="text-[10px] text-muted block font-medium">สิทธิ์วันเกิด</span>
          <span className="text-sm font-extrabold text-primary">
            {currentRank === 'PLATINUM' ? 'ลด 25% + Gift' : currentRank === 'GOLD' ? 'ลด 20%' : currentRank === 'SILVER' ? 'ลด 15%' : currentRank === 'BRONZE' ? 'ลด 10%' : 'ลด 5%'}
          </span>
        </div>
      </div>

      {/* Expandable Benefits List */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={() => setShowAllBenefits(!showAllBenefits)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition cursor-pointer"
        >
          <span>{showAllBenefits ? 'ซ่อนสิทธิประโยชน์' : 'ดูสิทธิประโยชน์ทั้งหมดของระดับนี้'}</span>
          {showAllBenefits ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAllBenefits && (
          <ul className="mt-3 space-y-1.5 rounded-xl border border-occasion-border bg-primary/5 p-3.5 text-xs text-muted">
            {(RANK_BENEFITS[currentRank] || []).map((b, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
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