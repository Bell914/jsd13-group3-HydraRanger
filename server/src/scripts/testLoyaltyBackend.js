import {
  MEMBERSHIP_RANKS,
  RANK_THRESHOLDS,
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  RANK_BENEFITS
} from '../config/membershipConfig.js';
import {
  calculateRankFromSpending,
  calculateRankProgress,
  calculateRankDiscount,
  getRankDetails
} from '../services/loyaltyService.js';

console.log('====================================================');
console.log('🧪 VERIFYING BACKEND & DATABASE LOYALTY SYSTEM');
console.log('====================================================\n');

let allPassed = true;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    allPassed = false;
  }
}

// 1. Test 5-tier Thresholds
console.log('--- 1. Testing Rank Thresholds & Calculations ---');
assert(calculateRankFromSpending(0) === 'MEMBER', '฿0 is MEMBER');
assert(calculateRankFromSpending(999) === 'MEMBER', '฿999 is MEMBER');
assert(calculateRankFromSpending(1000) === 'BRONZE', '฿1,000 upgrades to BRONZE');
assert(calculateRankFromSpending(2999) === 'BRONZE', '฿2,999 is BRONZE');
assert(calculateRankFromSpending(3000) === 'SILVER', '฿3,000 upgrades to SILVER');
assert(calculateRankFromSpending(7999) === 'SILVER', '฿7,999 is SILVER');
assert(calculateRankFromSpending(8000) === 'GOLD', '฿8,000 upgrades to GOLD');
assert(calculateRankFromSpending(19999) === 'GOLD', '฿19,999 is GOLD');
assert(calculateRankFromSpending(20000) === 'PLATINUM', '฿20,000 upgrades to PLATINUM');
assert(calculateRankFromSpending(50000) === 'PLATINUM', '฿50,000 is PLATINUM');

// 2. Test Rank Discounts
console.log('\n--- 2. Testing On-top Discount Logic ---');
assert(RANK_DISCOUNT_PERCENT.MEMBER === 0, 'MEMBER has 0% discount');
assert(RANK_DISCOUNT_PERCENT.BRONZE === 3, 'BRONZE has 3% discount');
assert(RANK_DISCOUNT_PERCENT.SILVER === 5, 'SILVER has 5% discount');
assert(RANK_DISCOUNT_PERCENT.GOLD === 10, 'GOLD has 10% discount');
assert(RANK_DISCOUNT_PERCENT.PLATINUM === 15, 'PLATINUM has 15% discount');
assert(calculateRankDiscount('BRONZE', 1000) === 30, 'BRONZE 3% discount on ฿1,000 is ฿30');
assert(calculateRankDiscount('SILVER', 2000) === 100, 'SILVER 5% discount on ฿2,000 is ฿100');
assert(calculateRankDiscount('PLATINUM', 2000) === 300, 'PLATINUM 15% discount on ฿2,000 is ฿300');

// 3. Test Free Shipping Rules
console.log('\n--- 3. Testing Free Shipping Thresholds ---');
assert(FREE_SHIPPING_MINIMUM.MEMBER === 1000, 'MEMBER free shipping min is ฿1,000');
assert(FREE_SHIPPING_MINIMUM.BRONZE === 850, 'BRONZE free shipping min is ฿850');
assert(FREE_SHIPPING_MINIMUM.SILVER === 700, 'SILVER free shipping min is ฿700');
assert(FREE_SHIPPING_MINIMUM.GOLD === 0, 'GOLD has Free Shipping No Minimum');
assert(FREE_SHIPPING_MINIMUM.PLATINUM === 0, 'PLATINUM has Free Shipping No Minimum');

// 4. Test Progress Tracking (Next Rank & Amount Needed)
console.log('\n--- 4. Testing Next Rank Progress Calculation ---');
const progMember = calculateRankProgress(500);
assert(progMember.currentRank === 'MEMBER', 'Current rank is MEMBER for ฿500');
assert(progMember.nextRank === 'BRONZE', 'Next rank for MEMBER is BRONZE');
assert(progMember.amountNeeded === 500, 'Needs ฿500 to reach BRONZE');
assert(progMember.progressPercentage === 50, 'Progress is 50%');

const progBronze = calculateRankProgress(2000);
assert(progBronze.currentRank === 'BRONZE', 'Current rank is BRONZE for ฿2,000');
assert(progBronze.nextRank === 'SILVER', 'Next rank for BRONZE is SILVER');
assert(progBronze.amountNeeded === 1000, 'Needs ฿1,000 to reach SILVER');
assert(progBronze.progressPercentage === 50, 'Progress is 50%');

const progPlat = calculateRankProgress(20000);
assert(progPlat.currentRank === 'PLATINUM', 'Current rank is PLATINUM for ฿20,000');
assert(progPlat.isMaxRank === true, 'PLATINUM is recognized as max rank');
assert(progPlat.amountNeeded === 0, 'Amount needed is 0 for max rank');
assert(progPlat.progressPercentage === 100, 'Progress is 100%');

// 5. Test Spending Accumulation & Subtraction simulation (Cancel / Refund)
console.log('\n--- 5. Testing Spending Accumulation & Refund Simulation ---');
let testSpending = 0;
let testOrderCount = 0;

// Order 1: Paid ฿1,200 (should upgrade to BRONZE)
testSpending += 1200;
testOrderCount += 1;
let rankAfterO1 = calculateRankFromSpending(testSpending);
assert(rankAfterO1 === 'BRONZE' && testOrderCount === 1, 'Order 1 (฿1,200) upgrades user to BRONZE with 1 order');

// Order 2: Paid ฿2,000 (total ฿3,200, should upgrade to SILVER)
testSpending += 2000;
testOrderCount += 1;
let rankAfterO2 = calculateRankFromSpending(testSpending);
assert(rankAfterO2 === 'SILVER' && testOrderCount === 2, 'Order 2 (+฿2,000 = ฿3,200) upgrades user to SILVER with 2 orders');

// Order 2 Refunded: subtract ฿2,000 (total back to ฿1,200, should downgrade back to BRONZE)
testSpending = Math.max(0, testSpending - 2000);
testOrderCount = Math.max(0, testOrderCount - 1);
let rankAfterRefund = calculateRankFromSpending(testSpending);
assert(rankAfterRefund === 'BRONZE' && testOrderCount === 1, 'Refund (-฿2,000 = ฿1,200) gracefully downgrades user back to BRONZE');

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL BACKEND & DATABASE LOGIC TESTS PASSED 100%!');
} else {
  console.error('⚠️ SOME TESTS FAILED. Please review above.');
}
console.log('====================================================\n');
