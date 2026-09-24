import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Coupon } from '../models/couponModel.js';
import { validateCoupon, claimCouponAtomically } from '../services/couponService.js';

test('validateCoupon queries with both code and userId to isolate user accounts', async (t) => {
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  let capturedQuery = null;

  t.mock.method(Coupon, 'findOne', async (query) => {
    capturedQuery = query;
    return {
      _id: new mongoose.Types.ObjectId(),
      code: query.code,
      userId: query.userId,
      discountValue: 5,
      isUsed: false,
      expiresAt: new Date(Date.now() + 86400000),
    };
  });

  // User A validates WELCOME5
  const resultA = await validateCoupon({
    code: 'WELCOME5',
    userId: userAId,
    subtotal: 1000,
  });

  assert.equal(capturedQuery.code, 'WELCOME5');
  assert.equal(String(capturedQuery.userId), String(userAId));
  assert.equal(resultA.valid, true);
  assert.equal(resultA.discountAmount, 50);

  // User B validates WELCOME5
  const resultB = await validateCoupon({
    code: 'welcome5',
    userId: userBId,
    subtotal: 2000,
  });

  assert.equal(capturedQuery.code, 'WELCOME5');
  assert.equal(String(capturedQuery.userId), String(userBId));
  assert.equal(resultB.valid, true);
  assert.equal(resultB.discountAmount, 100);
});

test('validateCoupon rejects if userId is missing', async () => {
  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        subtotal: 1000,
      });
    },
    /กรุณาเข้าสู่ระบบ/
  );
});

test('validateCoupon rejects if coupon not found for this user', async (t) => {
  const userCId = new mongoose.Types.ObjectId();
  t.mock.method(Coupon, 'findOne', async () => null);

  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        userId: userCId,
        subtotal: 1000,
      });
    },
    /ไม่พบโค้ดส่วนลดนี้ในระบบ หรือคุณไม่มีสิทธิ์ใช้งาน/
  );
});

test('validateCoupon rejects already used coupon', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  t.mock.method(Coupon, 'findOne', async () => ({
    _id: new mongoose.Types.ObjectId(),
    code: 'WELCOME5',
    userId,
    isUsed: true,
    expiresAt: new Date(Date.now() + 86400000),
  }));

  await assert.rejects(
    async () => {
      await validateCoupon({
        code: 'WELCOME5',
        userId,
        subtotal: 1000,
      });
    },
    /คูปองนี้ถูกใช้งานไปแล้ว/
  );
});

test('claimCouponAtomically only allows one claim when concurrent checkouts hit (race condition prevention)', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  let callCount = 0;

  // Simulate atomic findOneAndUpdate in MongoDB:
  // First call finds the document with isUsed: false, sets isUsed: true and returns it.
  // Second concurrent call matches 0 documents (because isUsed is now true) and returns null.
  t.mock.method(Coupon, 'findOneAndUpdate', async (filter, update) => {
    callCount += 1;
    assert.equal(filter.code, 'WELCOME5');
    assert.equal(String(filter.userId), String(userId));
    assert.equal(filter.isUsed, false);

    if (callCount === 1) {
      return {
        _id: new mongoose.Types.ObjectId(),
        code: filter.code,
        userId: filter.userId,
        isUsed: true,
        usedAt: new Date(),
        discountValue: 5,
      };
    }
    // Concurrent second request cannot find isUsed: false
    return null;
  });

  const [claim1, claim2] = await Promise.all([
    claimCouponAtomically({ code: 'WELCOME5', userId }),
    claimCouponAtomically({ code: 'WELCOME5', userId }),
  ]);

  // Exactly one checkout must succeed and the other must be rejected
  const successes = [claim1, claim2].filter((res) => res !== null);
  const failures = [claim1, claim2].filter((res) => res === null);

  assert.equal(successes.length, 1, 'Only one concurrent checkout can claim the coupon');
  assert.equal(failures.length, 1, 'The other concurrent checkout must receive null');
  assert.equal(successes[0].isUsed, true);
});
