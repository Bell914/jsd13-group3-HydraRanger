import { HTTP_STATUS } from '../config/constants.js';
import * as adminCouponService from '../services/adminCouponService.js';

function handleError(error, res, next) {
  if (error.code === 11000) return res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: 'Coupon code already exists' });
  if (error.message === 'Coupon not found') return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  return next(error);
}

export async function getAdminCoupons(req, res, next) {
  try { res.json({ success: true, data: await adminCouponService.getAdminCoupons() }); } catch (error) { next(error); }
}
export async function createAdminCoupon(req, res, next) {
  try { res.status(HTTP_STATUS.CREATED).json({ success: true, data: await adminCouponService.createAdminCoupon(req.body) }); } catch (error) { handleError(error, res, next); }
}
export async function updateAdminCoupon(req, res, next) {
  try { res.json({ success: true, data: await adminCouponService.updateAdminCoupon(req.params.id, req.body) }); } catch (error) { handleError(error, res, next); }
}
export async function updateAdminCouponStatus(req, res, next) {
  try { res.json({ success: true, data: await adminCouponService.updateAdminCouponStatus(req.params.id, req.body.isActive) }); } catch (error) { handleError(error, res, next); }
}
