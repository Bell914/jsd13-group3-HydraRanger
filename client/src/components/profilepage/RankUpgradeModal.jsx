import React from 'react';
import { Crown, Gem, Award, Shield, Medal, CheckCircle, ArrowRight, X } from 'lucide-react';
import { getRankTheme, RANK_BENEFITS } from '../../utils/loyaltyUtils.js';

export const RankUpgradeModal = ({ isOpen, onClose, newRank = 'SILVER', previousRank = 'MEMBER' }) => {
  if (!isOpen) return null;

  const theme = getRankTheme(newRank);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'PLATINUM':
        return <Award size={36} className="text-purple-300" />;
      case 'GOLD':
        return <Crown size={36} className="text-amber-300" />;
      case 'SILVER':
        return <Gem size={36} className="text-slate-200" />;
      case 'BRONZE':
        return <Medal size={36} className="text-amber-500" />;
      default:
        return <Shield size={36} className="text-blue-300" />;
    }
  };

  const unlockedPerks = RANK_BENEFITS[newRank] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#030712] text-white p-6 sm:p-8 shadow-2xl border border-white/15 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Celebration Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg mb-4">
          {getRankIcon(newRank)}
        </div>

        {/* Congratulation Message */}
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 mb-2">
          CONGRATULATIONS!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
          คุณได้รับการอัปเกรดเป็นระดับ
        </h2>
        <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider">
          {newRank}
        </div>
        <p className="text-xs text-gray-300 mt-2 max-w-xs mx-auto">
          ยอดซื้อสะสมของคุณถึงเกณฑ์แล้ว ระบบได้ปรับสิทธิประโยชน์และส่วนลด On-top ใหม่ให้คุณอัตโนมัติ
        </p>

        {/* Unlocked Benefits Card */}
        <div className="mt-5 text-left rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xs">
          <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wide block mb-2">
            สิทธิพิเศษใหม่ที่คุณปลดล็อก
          </span>
          <ul className="space-y-2 text-xs text-white/90">
            {unlockedPerks.map((perk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-gray-950 font-bold text-sm tracking-wide shadow-lg transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>รับสิทธิ์และเริ่มช้อปปิ้งเลย</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankUpgradeModal;
