import React from 'react';
import { Sparkles } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';
import { MembershipCard } from './MembershipCard.jsx';
import { MEMBER_PROMOTIONS } from '../../utils/loyaltyUtils.js';

const MEMBERSHIP_TIERS = [
  { rank: 'MEMBER', threshold: '฿0', discount: '-', birthday: 'ลด 5%', shipping: 'ครบ ฿1,000', extra: 'Welcome Coupon ลด 10%' },
  { rank: 'BRONZE', threshold: '฿1,000', discount: 'ลด 3%', birthday: 'ลด 10%', shipping: 'ครบ ฿850', extra: 'สะสมยอดต่อเนื่อง' },
  { rank: 'SILVER', threshold: '฿3,000', discount: 'ลด 5%', birthday: 'ลด 15%', shipping: 'ครบ ฿700', extra: 'Early Access 12 ชม.' },
  { rank: 'GOLD', threshold: '฿8,000', discount: 'ลด 10%', birthday: 'ลด 20%', shipping: 'ส่งฟรี ไม่มีขั้นต่ำ', extra: 'Early Access 24 ชม.' },
  { rank: 'PLATINUM', threshold: '฿20,000', discount: 'ลด 15%', birthday: 'ลด 25% + Gift', shipping: 'ส่งฟรี + Priority', extra: 'Early Access 48 ชม. + VIP Care' },
];

const rowHighlight = {
  MEMBER: 'bg-blue-50/50 font-semibold',
  BRONZE: 'bg-amber-100/40 font-semibold',
  SILVER: 'bg-slate-100/70 font-semibold',
  GOLD: 'bg-amber-50/70 font-semibold',
  PLATINUM: 'bg-purple-50/70 font-semibold',
};

const rankTextColor = {
  MEMBER: 'text-slate-800',
  BRONZE: 'text-amber-700',
  SILVER: 'text-slate-600',
  GOLD: 'text-amber-600',
  PLATINUM: 'text-purple-700',
};

export const MembershipSection = ({ user }) => {
  const currentRank = user?.membership?.rank || undefined;

  if (!user) {
    return (
      <EmptyState
        title="ยังไม่ได้เข้าสู่ระบบ"
        description="เข้าสู่ระบบเพื่อตรวจสอบระดับสมาชิกและสิทธิพิเศษของคุณ"
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">ระดับสมาชิกและสิทธิพิเศษ (Membership &amp; Loyalty)</h2>
      <MembershipCard user={user} />

      <div className="mt-8">
        <h3 className="text-base font-bold text-primary mb-3">เปรียบเทียบสิทธิประโยชน์แต่ละระดับ (Membership Tiers)</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">ระดับสมาชิก</th>
                <th className="p-3">ยอดซื้อสะสม</th>
                <th className="p-3">ส่วนลด On-top</th>
                <th className="p-3">คูปองวันเกิด</th>
                <th className="p-3">สิทธิ์ส่งฟรี</th>
                <th className="p-3">สิทธิพิเศษเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-600">
              {MEMBERSHIP_TIERS.map((tier) => (
                <tr key={tier.rank} className={currentRank === tier.rank ? rowHighlight[tier.rank] : ''}>
                  <td className={`p-3 font-bold ${rankTextColor[tier.rank]}`}>{tier.rank}</td>
                  <td className="p-3">{tier.threshold}</td>
                  <td className="p-3 text-emerald-600 font-bold">{tier.discount}</td>
                  <td className="p-3">{tier.birthday}</td>
                  <td className="p-3 text-blue-600 font-bold">{tier.shipping}</td>
                  <td className="p-3">{tier.extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-base font-bold text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>โปรโมชั่นพิเศษสำหรับสมาชิก (Member Exclusive Campaigns)</span>
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          สิทธิประโยชน์และแคมเปญพิเศษที่จัดขึ้นสำหรับสมาชิก OCCASION LOYALTY CLUB โดยเฉพาะ
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {MEMBER_PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className="rounded-2xl border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-white">
                    {promo.tag}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    {promo.period}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-1">
                  {promo.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                  {promo.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-amber-700">{promo.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};