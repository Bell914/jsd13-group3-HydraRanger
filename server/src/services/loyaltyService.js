import { User } from '../models/User.js';
import {
  MEMBERSHIP_RANKS,
  RANK_THRESHOLDS,
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  RANK_BENEFITS
} from '../config/membershipConfig.js';

/**
 * คำนวณระดับสมาชิกจากยอดซื้อสะสม
 * @param {number} spending - ยอดซื้อสะสม (บาท)
 * @returns {string} ชื่อระดับสมาชิก (MEMBER, SILVER, GOLD, PLATINUM)
 */
export const calculateRankFromSpending = (spending = 0) => {
  const amount = Number(spending) || 0;
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM]) {
    return MEMBERSHIP_RANKS.PLATINUM;
  }
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.GOLD]) {
    return MEMBERSHIP_RANKS.GOLD;
  }
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER]) {
    return MEMBERSHIP_RANKS.SILVER;
  }
  if (amount >= RANK_THRESHOLDS[MEMBERSHIP_RANKS.BRONZE]) {
    return MEMBERSHIP_RANKS.BRONZE;
  }
  return MEMBERSHIP_RANKS.MEMBER;
};

/**
 * ดึงข้อมูลสิทธิประโยชน์และเงื่อนไขของแต่ละระดับ
 * @param {string} rank - ชื่อระดับสมาชิก
 */
export const getRankDetails = (rank = MEMBERSHIP_RANKS.MEMBER) => {
  const validRank = MEMBERSHIP_RANKS[rank] || MEMBERSHIP_RANKS.MEMBER;
  return {
    rank: validRank,
    threshold: RANK_THRESHOLDS[validRank] || 0,
    discountPercent: RANK_DISCOUNT_PERCENT[validRank] || 0,
    freeShippingMinimum: FREE_SHIPPING_MINIMUM[validRank] ?? 1000,
    benefits: RANK_BENEFITS[validRank] || []
  };
};

/**
 * คำนวณส่วนลดตามระดับสมาชิกสำหรับยอดสินค้า
 * @param {string} rank - ระดับสมาชิก
 * @param {number} subtotal - ยอดรวมค่าสินค้าก่อนหักส่วนลด
 */
export const calculateRankDiscount = (rank, subtotal = 0) => {
  const percent = RANK_DISCOUNT_PERCENT[rank] || 0;
  if (percent <= 0) return 0;
  return Math.round(((subtotal * percent) / 100) * 100) / 100;
};

/**
 * คำนวณความคืบหน้าสู่ระดับถัดไป
 * @param {number} currentSpending - ยอดซื้อสะสมปัจจุบัน
 */
export const calculateRankProgress = (currentSpending = 0) => {
  const spending = Number(currentSpending) || 0;
  const currentRank = calculateRankFromSpending(spending);

  let nextRank = null;
  let targetThreshold = 0;

  if (currentRank === MEMBERSHIP_RANKS.MEMBER) {
    nextRank = MEMBERSHIP_RANKS.BRONZE;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.BRONZE];
  } else if (currentRank === MEMBERSHIP_RANKS.BRONZE) {
    nextRank = MEMBERSHIP_RANKS.SILVER;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.SILVER];
  } else if (currentRank === MEMBERSHIP_RANKS.SILVER) {
    nextRank = MEMBERSHIP_RANKS.GOLD;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.GOLD];
  } else if (currentRank === MEMBERSHIP_RANKS.GOLD) {
    nextRank = MEMBERSHIP_RANKS.PLATINUM;
    targetThreshold = RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM];
  } else {
    // อยู่ระดับสูงสุด (PLATINUM)
    return {
      currentRank,
      nextRank: null,
      currentSpending: spending,
      targetThreshold: RANK_THRESHOLDS[MEMBERSHIP_RANKS.PLATINUM],
      amountNeeded: 0,
      progressPercentage: 100,
      isMaxRank: true
    };
  }

  const previousThreshold = RANK_THRESHOLDS[currentRank];
  const tierSpan = targetThreshold - previousThreshold;
  const progressInTier = Math.max(0, spending - previousThreshold);
  const progressPercentage = Math.min(100, Math.round((progressInTier / tierSpan) * 100));
  const amountNeeded = Math.max(0, targetThreshold - spending);

  return {
    currentRank,
    nextRank,
    currentSpending: spending,
    targetThreshold,
    amountNeeded,
    progressPercentage,
    isMaxRank: false
  };
};

import { sendRankUpgradeEmail } from './emailService.js';

/**
 * บันทึกการเพิ่มหรือหักยอดซื้อสะสมของสมาชิก และอัปเดต Rank อัตโนมัติ
 * @param {string} userId - รหัสผู้ใช้
 * @param {number} netAmount - ยอดเงินจริงของออเดอร์ (ไม่รวมค่าส่ง)
 * @param {'ADD'|'SUBTRACT'} action - การกระทำ ('ADD' เมื่อจ่ายสำเร็จ, 'SUBTRACT' เมื่อยกเลิก/คืนเงิน)
 */
export const processOrderSpending = async (userId, netAmount, action = 'ADD') => {
  if (!userId || isNaN(netAmount) || netAmount <= 0) return null;

  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const currentSpending = Number(user.membership?.accumulatedSpending || 0);
    const currentOrderCount = Number(user.membership?.orderCount || 0);
    const amount = Number(netAmount);

    let newSpending = currentSpending;
    let newOrderCount = currentOrderCount;

    if (action === 'ADD') {
      newSpending = currentSpending + amount;
      newOrderCount = currentOrderCount + 1;
    } else if (action === 'SUBTRACT') {
      newSpending = Math.max(0, currentSpending - amount);
      newOrderCount = Math.max(0, currentOrderCount - 1);
    }

    const previousRank = user.membership?.rank || MEMBERSHIP_RANKS.MEMBER;
    const newRank = calculateRankFromSpending(newSpending);
    const isRankChanged = previousRank !== newRank;

    // คำนวณวันหมดอายุของ Rank (12 เดือนข้างหน้า)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    user.membership = {
      rank: newRank,
      accumulatedSpending: newSpending,
      orderCount: newOrderCount,
      rankUpdatedAt: isRankChanged ? new Date() : (user.membership?.rankUpdatedAt || new Date()),
      rankExpiresAt: newRank === MEMBERSHIP_RANKS.MEMBER ? null : (user.membership?.rankExpiresAt || expiresAt)
    };

    await user.save();

    // Trigger email notification on rank upgrade
    if (isRankChanged && action === 'ADD') {
      const benefits = RANK_BENEFITS[newRank] || [];
      sendRankUpgradeEmail(user, previousRank, newRank, benefits).catch((err) =>
        console.warn('Could not send rank upgrade email:', err.message)
      );
    }

    return {
      membership: user.membership,
      isRankChanged,
      previousRank,
      newRank
    };
  } catch (error) {
    console.error('Failed to process order spending for loyalty:', error);
    return null;
  }
};
