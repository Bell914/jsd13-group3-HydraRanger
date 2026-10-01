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
  [MEMBERSHIP_RANKS.GOLD]: 0, // ส่งฟรีไม่มีขั้นต่ำ
  [MEMBERSHIP_RANKS.PLATINUM]: 0 // ส่งฟรีไม่มีขั้นต่ำ + Priority
};

export const RANK_BENEFITS = {
  [MEMBERSHIP_RANKS.MEMBER]: [
    'คูปองต้อนรับ ลด 10%',
    'สะสมยอดซื้อเพื่อปลดล็อกระดับถัดไป',
    'บันทึกรายการสินค้าโปรด & Favorite Lookbooks'
  ],
  [MEMBERSHIP_RANKS.BRONZE]: [
    'ส่วนลด On-top 3% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 10%',
    'ส่งฟรีเมื่อซื้อครบ 850 บาท ปกติ 1,000 บาท'
  ],
  [MEMBERSHIP_RANKS.SILVER]: [
    'ส่วนลด On-top 5% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 15%',
    'ส่งฟรีเมื่อซื้อครบ 700 บาท ปกติ 1,000 บาท',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 12 ชม.'
  ],
  [MEMBERSHIP_RANKS.GOLD]: [
    'ส่วนลด On-top 10% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 20%',
    'ส่งฟรีทุกคำสั่งซื้อ ไม่มีขั้นต่ำ',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 24 ชม.'
  ],
  [MEMBERSHIP_RANKS.PLATINUM]: [
    'ส่วนลด On-top 15% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 25% + Exclusive Gift',
    'ส่งฟรีทุกคำสั่งซื้อ + บริการจัดส่งด่วนพิเศษ Priority Shipping',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 48 ชม.',
    'VIP Customer Care บริการดูแลและช่วยเหลือพิเศษแบบส่วนตัว'
  ]
};

export const VALID_COUPONS = {
  OCCWELCOME10: {
    code: 'OCCWELCOME10', title: 'คูปองต้อนรับสมาชิกใหม่', type: 'percent', value: 10,
    minSpend: 500, category: 'welcome', badge: 'Welcome Reward', cadence: 'once'
  },
  BRONZEVIP3: {
    code: 'BRONZEVIP3', title: 'ส่วนลดพิเศษประจำเดือน (BRONZE)', type: 'percent', value: 3,
    minSpend: 0, rank: 'BRONZE', category: 'monthly', badge: 'Tier Perk: BRONZE', cadence: 'monthly'
  },
  SILVERVIP5: {
    code: 'SILVERVIP5', title: 'ส่วนลดพิเศษประจำเดือน (SILVER)', type: 'percent', value: 5,
    minSpend: 0, rank: 'SILVER', category: 'monthly', badge: 'Tier Perk: SILVER', cadence: 'monthly'
  },
  GOLDVIP10: {
    code: 'GOLDVIP10', title: 'ส่วนลดพิเศษประจำเดือน (GOLD)', type: 'percent', value: 10,
    minSpend: 0, rank: 'GOLD', category: 'monthly', badge: 'Tier Perk: GOLD', cadence: 'monthly'
  },
  PLATINUMVIP15: {
    code: 'PLATINUMVIP15', title: 'ส่วนลดพิเศษประจำเดือน (PLATINUM)', type: 'percent', value: 15,
    minSpend: 0, rank: 'PLATINUM', category: 'monthly', badge: 'Tier Perk: PLATINUM', cadence: 'monthly'
  },
  BDAY5: {
    code: 'BDAY5', title: 'Birthday Celebration Privilege', type: 'percent', value: 5,
    minSpend: 0, rank: 'MEMBER', category: 'birthday', badge: 'Birthday Reward', cadence: 'yearly'
  },
  BDAY10: {
    code: 'BDAY10', title: 'Birthday Celebration Privilege', type: 'percent', value: 10,
    minSpend: 0, rank: 'BRONZE', category: 'birthday', badge: 'Birthday Reward', cadence: 'yearly'
  },
  BDAY15: {
    code: 'BDAY15', title: 'Birthday Celebration Privilege', type: 'percent', value: 15,
    minSpend: 0, rank: 'SILVER', category: 'birthday', badge: 'Birthday Reward', cadence: 'yearly'
  },
  BDAY20: {
    code: 'BDAY20', title: 'Birthday Celebration Privilege', type: 'percent', value: 20,
    minSpend: 0, rank: 'GOLD', category: 'birthday', badge: 'Birthday Reward', cadence: 'yearly'
  },
  BDAY25: {
    code: 'BDAY25', title: 'Birthday Celebration Privilege', type: 'percent', value: 25,
    minSpend: 0, rank: 'PLATINUM', category: 'birthday', badge: 'Birthday Reward', cadence: 'yearly'
  },
  OCCFREESHIP: {
    code: 'OCCFREESHIP', title: 'คูปองส่งฟรีไม่มีขั้นต่ำ', type: 'shipping', value: 100,
    minSpend: 0, category: 'shipping', badge: 'Free Shipping', cadence: 'monthly'
  }
};

export const SHIPPING_METHODS_CONFIG = {
  standard: { id: 'standard', name: 'STANDARD SHIPPING', price: 0 },
  express: { id: 'express', name: 'EXPRESS SHIPPING', price: 50 },
  priority: { id: 'priority', name: 'PRIORITY SHIPPING', price: 100 }
};
