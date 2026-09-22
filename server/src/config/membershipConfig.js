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
    'คูปองต้อนรับ (Welcome Coupon) ลด 10%',
    'สะสมยอดซื้อเพื่อปลดล็อกระดับถัดไป',
    'บันทึกรายการสินค้าโปรด (Wishlist) & Favorite Lookbooks'
  ],
  [MEMBERSHIP_RANKS.BRONZE]: [
    'ส่วนลด On-top 3% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 10%',
    'ส่งฟรีเมื่อซื้อครบ 850 บาท (ปกติ 1,000 บาท)'
  ],
  [MEMBERSHIP_RANKS.SILVER]: [
    'ส่วนลด On-top 5% ทุกคำสั่งซื้อ',
    'คูปองเดือนเกิด ลด 15%',
    'ส่งฟรีเมื่อซื้อครบ 700 บาท (ปกติ 1,000 บาท)',
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
    'ส่งฟรีทุกคำสั่งซื้อ + บริการจัดส่งด่วนพิเศษ (Priority Shipping)',
    'Early Access สิทธิ์ซื้อสินค้าคอลเลกชันใหม่ก่อนใคร 48 ชม.',
    'VIP Customer Care บริการดูแลและช่วยเหลือพิเศษแบบส่วนตัว'
  ]
};
