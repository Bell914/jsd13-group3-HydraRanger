import { HTTP_STATUS } from '../config/constants.js';
import * as reviewService from '../services/reviewService.js';

function sendReviewError(error, res, next) {
  const badRequestMessages = [
    'Rating must',
    'Review comment',
    'Invalid order',
    'Only customers',
    'สามารถรีวิวได้เฉพาะสินค้าที่จัดส่งเสร็จสิ้น (completed) แล้วเท่านั้น',
    'isVisible must'
  ];

  if (badRequestMessages.some((message) => error.message.startsWith(message))) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
  }
  if (error.message === 'Product not found' || error.message === 'Review not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  if (error.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'This product has already been reviewed for this order'
    });
  }
  return next(error);
}

export async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview(req.user._id || req.user.id, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    sendReviewError(error, res, next);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const result = await reviewService.getVisibleProductReviews(req.params.productId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMyReviews(req, res, next) {
  try {
    const reviews = await reviewService.getMyReviews(req.user._id || req.user.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getAdminReviews(req, res, next) {
  try {
    const reviews = await reviewService.getAllReviews();
    res.status(HTTP_STATUS.OK).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function updateReviewVisibility(req, res, next) {
  try {
    const review = await reviewService.updateReviewVisibility(
      req.params.id,
      req.body.isVisible
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Review visibility updated successfully',
      data: review
    });
  } catch (error) {
    sendReviewError(error, res, next);
  }
}
