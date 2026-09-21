export const MEMBERSHIP_RANKS = {
  MEMBER: 'MEMBER',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
};

export const RANK_THRESHOLDS = {
  [MEMBERSHIP_RANKS.MEMBER]: 0,
  [MEMBERSHIP_RANKS.SILVER]: 3000,
  [MEMBERSHIP_RANKS.GOLD]: 8000,
  [MEMBERSHIP_RANKS.PLATINUM]: 20000
};

export const RANK_DISCOUNT_PERCENT = {
  [MEMBERSHIP_RANKS.MEMBER]: 0,
  [MEMBERSHIP_RANKS.SILVER]: 5,
  [MEMBERSHIP_RANKS.GOLD]: 10,
  [MEMBERSHIP_RANKS.PLATINUM]: 15
};

export const FREE_SHIPPING_MINIMUM = {
  [MEMBERSHIP_RANKS.MEMBER]: 1000,
  [MEMBERSHIP_RANKS.SILVER]: 700,
  [MEMBERSHIP_RANKS.GOLD]: 0,
  [MEMBERSHIP_RANKS.PLATINUM]: 0
};

export const RANK_BENEFITS = {
  [MEMBERSHIP_RANKS.MEMBER]: [
    'คูปองต้อนรับ (Welcome Coupon) ลด 10%',
    'สะสมยอดซื้ออัตโนมัติเพื่อปลดล็อกระดับถัดไป',
    'บันทึกรายการสินค้าโปรด (Wishlist) & Favorite Lookbooks'
  ],
  [MEMBERSHIP_RANKS.SILVER]: [
    'ส่วนลด On-top 5% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 15% (1 สิทธิ์ในเดือนเกิด)',
    'ส่งฟรีเมื่อซื้อครบ 700 บาท (ปกติ 1,000 บาท)'
  ],
  [MEMBERSHIP_RANKS.GOLD]: [
    'ส่วนลด On-top 10% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 20%',
    'ส่งฟรีทุกคำสั่งซื้อ ไม่มีขั้นต่ำ (Free Shipping No Minimum)',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 24 ชม.'
  ],
  [MEMBERSHIP_RANKS.PLATINUM]: [
    'ส่วนลด On-top 15% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 25% + Exclusive Gift Set',
    'ส่งฟรีทุกคำสั่งซื้อ + บริการจัดส่งด่วนพิเศษ (Priority Shipping)',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 48 ชม.',
    'VIP Customer Care บริการดูแลช่วยเหลือพิเศษแบบส่วนตัว'
  ]
};

export const calculateRankFromSpending = (spending = 0) => {
  const amount = Number(spending) || 0;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM]) return MEMBERSHIP_RANKS.PLATINUM;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.GOLD]) return MEMBERSHIP_RANKS.GOLD;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER]) return MEMBERSHIP_RANKS.SILVER;
  return MEMBERSHIP_RANKS.MEMBER;
};

export const calculateProgress = (spending = 0) => {
  const amount = Number(spending) || 0;
  const currentRank = calculateRankFromSpending(amount);

  if (currentRank === MEMBERSHIP_RANKS.PLATINUM) {
    return {
      currentRank,
      nextRank: null,
      currentSpending: amount,
      targetThreshold: RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM],
      amountNeeded: 0,
      progressPercentage: 100,
      isMaxRank: true
    };
  }

  let nextRank = MEMBERSHIP_RANKS.SILVER;
  let targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER];

  if (currentRank === MEMBERSHIP_RANKS.SILVER) {
    nextRank = MEMBERSHIP_RANKS.GOLD;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.GOLD];
  } else if (currentRank === MEMBERSHIP_RANKS.GOLD) {
    nextRank = MEMBERSHIP_RANKS.PLATINUM;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM];
  }

  const previousThreshold = RANK_THRESHOLDS[currentRank];
  const tierSpan = targetThreshold - previousThreshold;
  const progressInTier = Math.max(0, amount - previousThreshold);
  const progressPercentage = Math.min(100, Math.round((progressInTier / tierSpan) * 100));
  const amountNeeded = Math.max(0, targetThreshold - amount);

  return {
    currentRank,
    nextRank,
    currentSpending: amount,
    targetThreshold,
    amountNeeded,
    progressPercentage,
    isMaxRank: false
  };
};

export const getRankTheme = (rank = MEMBERSHIP_RANKS.MEMBER) => {
  switch (rank) {
    case MEMBERSHIP_RANKS.PLATINUM:
      return {
        name: 'PLATINUM',
        labelTh: 'ระดับแพลทินัม',
        cardGradient: 'from-[#0b0c1b] via-[#1a1233] to-[#251545]',
        cardBorder: 'border-purple-500/30',
        badgeBg: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-400/40',
        accentColor: 'text-purple-300',
        barColor: 'bg-gradient-to-r from-purple-400 to-indigo-300'
      };
    case MEMBERSHIP_RANKS.GOLD:
      return {
        name: 'GOLD',
        labelTh: 'ระดับโกลด์',
        cardGradient: 'from-[#1e1505] via-[#332205] to-[#472d06]',
        cardBorder: 'border-amber-500/30',
        badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40',
        accentColor: 'text-amber-300',
        barColor: 'bg-gradient-to-r from-amber-400 to-yellow-300'
      };
    case MEMBERSHIP_RANKS.SILVER:
      return {
        name: 'SILVER',
        labelTh: 'ระดับซิลเวอร์',
        cardGradient: 'from-[#161a22] via-[#21262d] to-[#30363d]',
        cardBorder: 'border-slate-400/30',
        badgeBg: 'bg-gradient-to-r from-slate-400/20 to-gray-300/20 text-slate-200 border border-slate-300/40',
        accentColor: 'text-slate-200',
        barColor: 'bg-gradient-to-r from-slate-300 to-white'
      };
    default:
      return {
        name: 'MEMBER',
        labelTh: 'ระดับสมาชิกทั่วไป',
        cardGradient: 'from-[#0f172a] via-[#1e293b] to-[#334155]',
        cardBorder: 'border-blue-400/20',
        badgeBg: 'bg-blue-500/15 text-blue-200 border border-blue-400/30',
        accentColor: 'text-blue-300',
        barColor: 'bg-gradient-to-r from-blue-400 to-sky-300'
      };
  }
};
