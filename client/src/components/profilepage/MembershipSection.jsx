import React from "react";
import { Gift } from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";
import { MembershipCard } from "./MembershipCard.jsx";
import { MEMBER_PROMOTIONS } from "../../utils/loyaltyUtils.js";

const MEMBERSHIP_TIERS = [
  {
    rank: "MEMBER",
    threshold: "฿0",
    discount: "-",
    birthday: "ลด 5%",
    shipping: "ครบ ฿1,000",
    extra: "Welcome Coupon ลด 10%",
  },
  {
    rank: "BRONZE",
    threshold: "฿1,000",
    discount: "ลด 3%",
    birthday: "ลด 10%",
    shipping: "ครบ ฿850",
    extra: "สะสมยอดต่อเนื่อง",
  },
  {
    rank: "SILVER",
    threshold: "฿3,000",
    discount: "ลด 5%",
    birthday: "ลด 15%",
    shipping: "ครบ ฿700",
    extra: "Early Access 12 ชม.",
  },
  {
    rank: "GOLD",
    threshold: "฿8,000",
    discount: "ลด 10%",
    birthday: "ลด 20%",
    shipping: "ส่งฟรี ไม่มีขั้นต่ำ",
    extra: "Early Access 24 ชม.",
  },
  {
    rank: "PLATINUM",
    threshold: "฿20,000",
    discount: "ลด 15%",
    birthday: "ลด 25% + Gift",
    shipping: "ส่งฟรี + Priority",
    extra: "Early Access 48 ชม. + VIP Care",
  },
];

const rowHighlight = "bg-primary/5 font-semibold";
const rankTextColor = "text-primary font-bold";

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
      <h2 className="text-lg font-semibold text-primary mb-4">
        ระดับสมาชิกและสิทธิพิเศษ
      </h2>
      <MembershipCard user={user} />

      <div className="mt-8">
        <h3 className="text-base font-bold text-primary mb-3">
          เปรียบเทียบสิทธิประโยชน์แต่ละระดับ
        </h3>
        <div className="overflow-x-auto rounded-xl border border-occasion-border">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-primary text-white font-bold border-b border-primary-hover">
              <tr>
                <th className="p-3">ระดับสมาชิก</th>
                <th className="p-3">ยอดซื้อสะสม</th>
                <th className="p-3">ส่วนลด On-top</th>
                <th className="p-3">คูปองวันเกิด</th>
                <th className="p-3">สิทธิ์ส่งฟรี</th>
                <th className="p-3">สิทธิพิเศษเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-occasion-border text-muted">
              {MEMBERSHIP_TIERS.map((tier) => (
                <tr
                  key={tier.rank}
                  className={currentRank === tier.rank ? rowHighlight : ""}
                >
                  <td className={`p-3 ${rankTextColor}`}>{tier.rank}</td>
                  <td className="p-3">{tier.threshold}</td>
                  <td className="p-3 text-accent font-bold">{tier.discount}</td>
                  <td className="p-3">{tier.birthday}</td>
                  <td className="p-3 text-primary font-bold">
                    {tier.shipping}
                  </td>
                  <td className="p-3">{tier.extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-occasion-border">
        <h3 className="text-base font-bold text-primary flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" />
          <span>โปรโมชั่นพิเศษสำหรับสมาชิก</span>
        </h3>
        <p className="text-xs text-muted mt-0.5">
          สิทธิประโยชน์และแคมเปญพิเศษที่จัดขึ้นสำหรับสมาชิก OCCASION LOYALTY
          CLUB โดยเฉพาะ
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {MEMBER_PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className="rounded-2xl border border-occasion-border bg-surface p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="w-[110px] flex items-center justify-center text-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary text-white">
                    {promo.tag}
                  </span>
                  <span className="text-[10px] font-semibold text-muted">
                    {promo.period}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-primary mt-1">
                  {promo.title}
                </h4>
                <p className="text-xs text-muted mt-1 line-clamp-3">
                  {promo.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-occasion-border/50 flex items-center justify-between text-[11px] text-muted">
                <span className="font-semibold text-accent">{promo.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
