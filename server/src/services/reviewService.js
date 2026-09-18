import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';

const PAID_ORDER_STATUSES = ['paid', 'processing', 'shipped', 'completed'];

function validateReviewInput(reviewData) {
  const rating = Number(reviewData.rating);
  const comment = reviewData.comment?.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer from 1 to 5');
  }
  if (!comment || comment.length < 3) {
    throw new Error('Review comment must contain at least 3 characters');
  }

  return { rating, comment };
}

export async function createReview(userId, reviewData) {
  if (
    !mongoose.Types.ObjectId.isValid(reviewData.orderId) ||
    !mongoose.Types.ObjectId.isValid(reviewData.productId)
  ) {
    throw new Error('Invalid order or product');
  }

  const { rating, comment } = validateReviewInput(reviewData);
  const order = await Order.findOne({
    _id: reviewData.orderId,
    user: userId,
    status: { $in: PAID_ORDER_STATUSES },
    'items.product': reviewData.productId
  });

  if (!order) {
    throw new Error('Only customers with a paid order can review this product');
  }

  const product = await Product.findById(reviewData.productId);
  if (!product) throw new Error('Product not found');

  return Review.create({
    user: userId,
    product: reviewData.productId,
    order: reviewData.orderId,
    rating,
    comment
  });
}

export async function getVisibleProductReviews(productId) {
  const reviews = await Review.find({ product: productId, isVisible: true })
    .populate('user', 'username avatar')
    .sort({ createdAt: -1 });

  const averageRating = reviews.length === 0
    ? 0
    : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return { reviews, count: reviews.length, averageRating };
}

export function getAllReviews() {
  return Review.find()
    .populate('user', 'username email')
    .populate('product', 'title')
    .sort({ createdAt: -1 });
}

export async function updateReviewVisibility(reviewId, isVisible) {
  if (typeof isVisible !== 'boolean') throw new Error('isVisible must be true or false');

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isVisible },
    { new: true, runValidators: true }
  )
    .populate('user', 'username email')
    .populate('product', 'title');

  if (!review) throw new Error('Review not found');
  return review;
}
