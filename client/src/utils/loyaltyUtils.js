export const MEMBERSHIP_RANKS = {
  MEMBER: 'MEMBER',
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  PLATINUM: 'PLATINUM'
};

export const RANK_THRESHOLDS = {
  [MEMBERSHIP_RANKS.MEMBER]: 0,
  [MEMBERSHIP_RANKS.BRONZE]: 1000,
  [MEMBERSHIP_RANKS.SILVER]: 3000,
  [MEMBERSHIP_RANKS.GOLD]: 8000,
  [MEMBERSHIP_RANKS.PLATINUM]: 20000
};

export const RANK_DISCOUNT_PERCENT = {
  [MEMBERSHIP_RANKS.MEMBER]: 0,
  [MEMBERSHIP_RANKS.BRONZE]: 3,
  [MEMBERSHIP_RANKS.SILVER]: 5,
  [MEMBERSHIP_RANKS.GOLD]: 10,
  [MEMBERSHIP_RANKS.PLATINUM]: 15
};

export const FREE_SHIPPING_MINIMUM = {
  [MEMBERSHIP_RANKS.MEMBER]: 1000,
  [MEMBERSHIP_RANKS.BRONZE]: 850,
  [MEMBERSHIP_RANKS.SILVER]: 700,
  [MEMBERSHIP_RANKS.GOLD]: 0,
  [MEMBERSHIP_RANKS.PLATINUM]: 0
};

export const RANK_BENEFITS = {
  [MEMBERSHIP_RANKS.MEMBER]: [
    'คูปองต้อนรับ ลด 10%',
    'สะสมยอดซื้ออัตโนมัติเพื่อปลดล็อกระดับถัดไป',
    'บันทึกรายการสินค้าโปรด & Favorite Lookbooks'
  ],
  [MEMBERSHIP_RANKS.BRONZE]: [
    'ส่วนลด On-top 3% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 10% 1 สิทธิ์ในเดือนเกิด',
    'ส่งฟรีเมื่อซื้อครบ 850 บาท ปกติ 1,000 บาท'
  ],
  [MEMBERSHIP_RANKS.SILVER]: [
    'ส่วนลด On-top 5% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 15% 1 สิทธิ์ในเดือนเกิด',
    'ส่งฟรีเมื่อซื้อครบ 700 บาท ปกติ 1,000 บาท',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 12 ชม.'
  ],
  [MEMBERSHIP_RANKS.GOLD]: [
    'ส่วนลด On-top 10% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 20%',
    'ส่งฟรีทุกคำสั่งซื้อ ไม่มีขั้นต่ำ',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 24 ชม.'
  ],
  [MEMBERSHIP_RANKS.PLATINUM]: [
    'ส่วนลด On-top 15% ทุกคำสั่งซื้อ',
    'คูปองวันเกิด ลด 25% + Exclusive Gift Set',
    'ส่งฟรีทุกคำสั่งซื้อ + บริการจัดส่งด่วนพิเศษ Priority Shipping',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 48 ชม.',
    'VIP Customer Care บริการดูแลช่วยเหลือพิเศษแบบส่วนตัว'
  ]
};

export const calculateRankFromSpending = (spending = 0) => {
  const amount = Number(spending) || 0;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM]) return MEMBERSHIP_RANKS.PLATINUM;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.GOLD]) return MEMBERSHIP_RANKS.GOLD;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER]) return MEMBERSHIP_RANKS.SILVER;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.BRONZE]) return MEMBERSHIP_RANKS.BRONZE;
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

  let nextRank = MEMBERSHIP_RANKS.BRONZE;
  let targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.BRONZE];

  if (currentRank === MEMBERSHIP_RANKS.BRONZE) {
    nextRank = MEMBERSHIP_RANKS.SILVER;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER];
  } else if (currentRank === MEMBERSHIP_RANKS.SILVER) {
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
    case MEMBERSHIP_RANKS.BRONZE:
      return {
        name: 'BRONZE',
        labelTh: 'ระดับบรอนซ์',
        cardGradient: 'from-[#1c120c] via-[#2d1b0f] to-[#422213]',
        cardBorder: 'border-amber-700/40',
        badgeBg: 'bg-gradient-to-r from-amber-700/20 to-orange-800/20 text-amber-300 border border-amber-600/40',
        accentColor: 'text-amber-400',
        barColor: 'bg-gradient-to-r from-amber-600 to-amber-400'
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

export const hasEarlyAccess = (rank = MEMBERSHIP_RANKS.MEMBER) => {
  return rank === MEMBERSHIP_RANKS.SILVER || rank === MEMBERSHIP_RANKS.GOLD || rank === MEMBERSHIP_RANKS.PLATINUM;
};

export const NEXT_RANK_PERKS = {
  [MEMBERSHIP_RANKS.MEMBER]: {
    targetRank: MEMBERSHIP_RANKS.BRONZE,
    highlights: [
      'ปลดล็อกส่วนลด On-top 3% ทุกคำสั่งซื้อ',
      'ลดเกณฑ์ส่งฟรีเหลือเพียง ฿850 จากเดิม ฿1,000',
      'สิทธิ์ส่วนลดวันเกิด 10%'
    ]
  },
  [MEMBERSHIP_RANKS.BRONZE]: {
    targetRank: MEMBERSHIP_RANKS.SILVER,
    highlights: [
      'อัปเกรดส่วนลด On-top เป็น 5% ทุกคำสั่งซื้อ',
      'ลดเกณฑ์ส่งฟรีเหลือเพียง ฿700',
      'Early Access ช้อปคอลเลกชันใหม่ก่อนใคร 12 ชม.'
    ]
  },
  [MEMBERSHIP_RANKS.SILVER]: {
    targetRank: MEMBERSHIP_RANKS.GOLD,
    highlights: [
      'อัปเกรดส่วนลด On-top เป็น 10% ทุกคำสั่งซื้อ',
      'สิทธิ์ส่งฟรีไม่มีขั้นต่ำทุกออเดอร์',
      'Early Access ช้อปคอลเลกชันใหม่ก่อนใคร 24 ชม.'
    ]
  },
  [MEMBERSHIP_RANKS.GOLD]: {
    targetRank: MEMBERSHIP_RANKS.PLATINUM,
    highlights: [
      'ส่วนลด On-top สูงสุด 15% ทุกคำสั่งซื้อ',
      'จัดส่งด่วนพิเศษฟรี Priority Free Shipping',
      'Early Access 48 ชม. + VIP Care & Gift Set วันเกิด'
    ]
  }
};

export const MEMBER_PROMOTIONS = [
  {
    id: 'promo-1',
    title: 'OCCASION Member Days',
    tag: 'EXCLUSIVE',
    badge: 'สำหรับทุกระดับสมาชิก',
    description: 'รับส่วนลด On-top ประจำระดับสมาชิกเพิ่มทันทีเมื่อช้อปเสื้อผ้าคอลเลกชัน Seasonal ล่าสุด',
    period: 'ตลอดเดือนนี้',
    color: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-800'
  },
  {
    id: 'promo-2',
    title: 'Double Spending Weekend',
    tag: 'VIP TIER',
    badge: 'สำหรับ GOLD & PLATINUM',
    description: 'ช้อปสุดสัปดาห์นี้นับยอดซื้อสะสม x2 เพื่อการรักษาระดับและปลดล็อกรีวอร์ดเร็วยิ่งขึ้น',
    period: 'ทุกวันเสาร์ - อาทิตย์',
    color: 'from-amber-600/20 to-yellow-600/10 border-amber-500/30 text-amber-900'
  },
  {
    id: 'promo-3',
    title: 'New Lookbook Early Drop',
    tag: 'EARLY ACCESS',
    badge: 'สำหรับ SILVER ขึ้นไป',
    description: 'เปิดให้พรีออเดอร์และสั่งซื้อไอเทม Lookbook ใหม่ล่วงหน้าก่อนเปิดขายทั่วไป',
    period: '24 - 48 ชม. ก่อนเปิดตัว',
    color: 'from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-900'
  }
];

export const getCouponsForUser = (rank = MEMBERSHIP_RANKS.MEMBER, birthMonth = 8) => {
  const currentMonth = new Date().getMonth() + 1;
  const isBirthMonth = currentMonth === birthMonth;

  const coupons = [
    {
      id: 'c-welcome-5',
      code: 'WELCOME5',
      title: 'คูปองต้อนรับสมาชิกใหม่',
      discountType: 'percent',
      discountValue: 5,
      minSpend: 0,
      expiresAt: '30 วันหลังสมัคร',
      category: 'welcome',
      badge: 'New Member 5%',
      usable: true
    },
    {
      id: 'c-welcome',
      code: 'OCCWELCOME10',
      title: 'คูปองต้อนรับสมาชิกใหม่',
      discountType: 'percent',
      discountValue: 10,
      minSpend: 500,
      expiresAt: '2026-12-31',
      category: 'welcome',
      badge: 'Welcome Reward',
      usable: true
    },
    {
      id: 'c-tier',
      code:
        rank === MEMBERSHIP_RANKS.PLATINUM
          ? 'PLATINUMVIP15'
          : rank === MEMBERSHIP_RANKS.GOLD
            ? 'GOLDVIP10'
            : rank === MEMBERSHIP_RANKS.SILVER
              ? 'SILVERVIP5'
              : rank === MEMBERSHIP_RANKS.BRONZE
                ? 'BRONZEVIP3'
                : 'MEMBERPERK',
      title: 'ส่วนลดพิเศษประจำเดือน',
      discountType: 'percent',
      discountValue: RANK_DISCOUNT_PERCENT[rank] || 3,
      minSpend: 0,
      expiresAt: 'สิ้นเดือนนี้',
      category: 'monthly',
      badge: `Tier Perk ${rank}`,
      usable: true
    },
    {
      id: 'c-bday',
      code: `BDAY${rank}2026`,
      title: 'Birthday Celebration Privilege',
      discountType: 'percent',
      discountValue:
        rank === MEMBERSHIP_RANKS.PLATINUM
          ? 25
          : rank === MEMBERSHIP_RANKS.GOLD
            ? 20
            : rank === MEMBERSHIP_RANKS.SILVER
              ? 15
              : rank === MEMBERSHIP_RANKS.BRONZE
                ? 10
                : 5,
      minSpend: 0,
      expiresAt: isBirthMonth ? 'สิ้นสุดเดือนเกิดของคุณ' : 'ใช้ได้ในเดือนเกิด',
      category: 'birthday',
      badge: 'Birthday Reward',
      usable: isBirthMonth,
      isBirthdayReward: true
    },
    {
      id: 'c-ship',
      code: 'OCCFREESHIP',
      title: 'คูปองส่งฟรีไม่มีขั้นต่ำ',
      discountType: 'shipping',
      discountValue: 50,
      minSpend: 0,
      expiresAt: '2026-12-31',
      category: 'shipping',
      badge: 'Free Shipping',
      usable: true
    }
  ];

  return coupons;
};
