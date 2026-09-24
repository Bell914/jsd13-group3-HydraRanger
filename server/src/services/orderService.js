import mongoose from 'mongoose';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import * as loyaltyService from './loyaltyService.js';
import {
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  VALID_COUPONS,
  SHIPPING_METHODS_CONFIG
} from '../config/membershipConfig.js';
import { Coupon } from '../models/couponModel.js';
import { markCouponAsUsed, refundCouponUsage } from './couponService.js';

const SHIPPING_COSTS = {
  standard: 0,
  express: 50,
  priority: 100
};

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `OCC-${date}-${random}`;
}

function getImageUrl(product) {
  if (!product.images?.length) return '';
  const sortedImages = [...product.images].sort(
    (first, second) => (first.display_order || 0) - (second.display_order || 0)
  );
  return sortedImages[0].image_url;
}

function findVariant(product, item) {
  return product.variants.find((variant) => {
    return String(variant._id) === String(item.variantId) || variant.sku === item.sku;
  });
}

async function prepareOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const preparedItems = [];

  for (const item of items) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      throw new Error('Invalid product in order');
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Order quantity must be a positive integer');
    }

    const product = await Product.findOne({ _id: item.productId, is_active: { $ne: false } });
    if (!product) throw new Error('Product in order was not found');

    const variant = findVariant(product, item);
    if (!variant) throw new Error(`Variant for ${product.title} was not found`);
    if (variant.stock_quantity < quantity) {
      throw new Error(`Not enough stock for ${product.title}`);
    }

    preparedItems.push({
      product: product._id,
      variantId: variant._id,
      sku: variant.sku,
      title: product.title,
      variant: variant.size_or_color,
      imageUrl: getImageUrl(product),
      unitPrice: variant.price,
      quantity,
      lineTotal: variant.price * quantity
    });
  }

  return preparedItems;
}

function wasUpdated(result) {
  return (result.modifiedCount ?? result.nModified ?? 0) === 1;
}

async function restoreOrderStock(items) {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock_quantity': item.quantity } }
    );
  }
}

async function reserveOrderStock(items) {
  const reservedItems = [];

  try {
    for (const item of items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          variants: {
            $elemMatch: {
              _id: item.variantId,
              stock_quantity: { $gte: item.quantity }
            }
          }
        },
        { $inc: { 'variants.$.stock_quantity': -item.quantity } }
      );

      if (!wasUpdated(result)) {
        throw new Error(`Not enough stock for ${item.title}`);
      }

      reservedItems.push(item);
    }
  } catch (error) {
    await restoreOrderStock(reservedItems);
    throw error;
  }
}

export function getShippingCost(shippingMethod = 'standard') {
  if (!Object.hasOwn(SHIPPING_COSTS, shippingMethod)) {
    throw new Error('Invalid shipping method');
  }
  return SHIPPING_COSTS[shippingMethod];
}

function validateShippingAddress(address) {
  const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'zipCode'];
  const missingFields = requiredFields.filter((field) => !address?.[field]?.trim());
  if (missingFields.length > 0) {
    throw new Error(`Missing shipping fields: ${missingFields.join(', ')}`);
  }
}

export async function createOrder(user, orderData) {
  validateShippingAddress(orderData.shippingAddress);
  const items = await prepareOrderItems(orderData.items);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  // 1. Calculate discount from member tier
  const membershipTierAtPurchase = user?.membership?.rank || 'MEMBER';
  const rankPercent = RANK_DISCOUNT_PERCENT[membershipTierAtPurchase] || 0;
  let calculatedDiscount = rankPercent > 0 ? Math.round((subtotal * rankPercent) / 100) : 0;

  // 2. Validate coupon if provided
  const couponCode = orderData.couponCode ? String(orderData.couponCode).trim().toUpperCase() : '';
  let appliedDbCoupon = null;
  if (couponCode) {
    // 2.1 First check dynamic user coupons in MongoDB (e.g. WELCOME5)
    try {
      const dbCoupon = await Coupon.findOne({
        code: couponCode,
        userId: user?._id || user?.id,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });
      if (dbCoupon) {
        appliedDbCoupon = dbCoupon;
        const couponDiscount = Math.round((subtotal * dbCoupon.discountValue) / 100);
        calculatedDiscount = Math.max(calculatedDiscount, couponDiscount);
      }
    } catch (couponErr) {
      console.warn('Coupon lookup warning:', couponErr.message);
    }

    // 2.2 Fallback to static VALID_COUPONS (Tier coupons, birthday coupons)
    if (!appliedDbCoupon) {
      const coupon = VALID_COUPONS[couponCode];
      if (coupon) {
        if (subtotal >= (coupon.minSpend || 0)) {
          if (coupon.type === 'percent') {
            const couponDiscount = Math.round((subtotal * coupon.value) / 100);
            calculatedDiscount = Math.max(calculatedDiscount, couponDiscount);
          } else if (coupon.type === 'fixed') {
            calculatedDiscount = Math.max(calculatedDiscount, coupon.value);
          }
        }
      }
    }
  }
  const discountAmount = Math.min(subtotal, calculatedDiscount);

  // 3. Calculate shipping cost based on shipping method and free shipping rules
  const methodKey = String(orderData.shippingMethod || 'standard').toLowerCase();
  const selectedMethod = SHIPPING_METHODS_CONFIG[methodKey] || SHIPPING_METHODS_CONFIG.standard;
  const baseShippingCost = selectedMethod.price;

  const freeShippingThreshold = FREE_SHIPPING_MINIMUM[membershipTierAtPurchase] ?? 1000;
  const isFreeShipping = freeShippingThreshold === 0 || subtotal >= freeShippingThreshold;

  let shippingCost = baseShippingCost;
  if (methodKey === 'standard') {
    shippingCost = isFreeShipping ? 0 : 50;
  } else if (membershipTierAtPurchase === 'PLATINUM' && methodKey === 'priority') {
    shippingCost = 0; // Platinum priority shipping is free
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.06 * 100) / 100;
  const totalAmount = taxableSubtotal + shippingCost + taxAmount;

  await reserveOrderStock(items);

  let order;
  try {
    order = await Order.create({
      orderNumber: createOrderNumber(),
      user: user._id || user.id,
      customerEmail: orderData.email || user.email,
      items,
      shippingAddress: {
        firstName: orderData.shippingAddress?.firstName,
        lastName: orderData.shippingAddress?.lastName,
        phone: orderData.shippingAddress?.phone,
        address: orderData.shippingAddress?.address,
        city: orderData.shippingAddress?.city,
        state: orderData.shippingAddress?.state || '',
        zipCode: orderData.shippingAddress?.zipCode,
        country: orderData.shippingAddress?.location || orderData.shippingAddress?.country || 'Thailand',
        deliveryNote: orderData.shippingAddress?.deliveryNote || ''
      },
      shippingMethod: orderData.shippingMethod || 'standard',
      paymentMethod: orderData.paymentMethod || 'credit-card',
      subtotal,
      discountAmount,
      couponCode,
      membershipTierAtPurchase,
      shippingCost,
      taxAmount,
      totalAmount,
      loyaltyProcessed: false,
      stockReserved: true
    });
  } catch (error) {
    await restoreOrderStock(items);
    throw error;
  }

  // Mark dynamic coupon as used
  if (appliedDbCoupon) {
    try {
      await markCouponAsUsed(appliedDbCoupon._id, order._id);
    } catch (err) {
      console.error('Failed to mark coupon as used:', err.message);
    }
  }

  return Order.findById(order._id).populate('user', 'username email');
}

export function getMyOrders(userId) {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getOrderById(orderId, userId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Order not found');
  }

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate('user', 'username email');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

export function getAllOrders() {
  return Order.find().populate('user', 'username email').sort({ createdAt: -1 });
}

export async function updateOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid order status');

  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) throw new Error('Order not found');

  if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
    throw new Error('Cancelled order status cannot be changed');
  }

  existingOrder.status = status;

  if (status === 'cancelled') {
    if (existingOrder.stockReserved && !existingOrder.stockRestored) {
      await restoreOrderStock(existingOrder.items);
      existingOrder.stockRestored = true;
    }
  }

  const userId = existingOrder.user?._id || existingOrder.user?.id || existingOrder.user;
  const netSpend = Math.max(0, existingOrder.subtotal - (existingOrder.discountAmount || 0));

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch {
    session = null;
  }

  try {
    if (userId && !existingOrder.loyaltyProcessed && ['paid', 'completed'].includes(status)) {
      await loyaltyService.processOrderSpending(userId, netSpend, 'ADD', session);
      existingOrder.loyaltyProcessed = true;
    } else if (userId && existingOrder.loyaltyProcessed && ['cancelled', 'refunded'].includes(status)) {
      await loyaltyService.processOrderSpending(userId, netSpend, 'SUBTRACT', session);
      existingOrder.loyaltyProcessed = false;
    }

    if (session) {
      await existingOrder.save({ session });
      await session.commitTransaction();
    } else {
      await existingOrder.save();
    }
  } catch (err) {
    if (session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // Refund coupon if order was cancelled or refunded
  if (['cancelled', 'refunded'].includes(status) && existingOrder.couponCode && userId) {
    try {
      await refundCouponUsage({
        code: existingOrder.couponCode,
        userId,
        orderId: existingOrder._id
      });
    } catch (refundErr) {
      console.warn('Coupon refund warning on updateOrderStatus:', refundErr.message);
    }
  }

  const order = await Order.findById(orderId).populate('user', 'username email');
  return order;
}
export async function cancelOrder(userId, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Order not found');
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      user: userId,
      status: { $in: ['pending', 'paid'] }
    },
    { status: 'cancelled' },
    { new: true, runValidators: true }
  );

  if (order) {
    if (order.stockReserved && !order.stockRestored) {
      await restoreOrderStock(order.items);
    }
    order.stockRestored = true;

    // Refund coupon if applicable
    if (order.couponCode) {
      try {
        await refundCouponUsage({
          code: order.couponCode,
          userId,
          orderId: order._id
        });
      } catch (refundErr) {
        console.warn('Coupon refund warning on cancelOrder:', refundErr.message);
      }
    }

    return order.save();
  }

  const existingOrder = await getOrderById(orderId, userId);

  if (existingOrder.status === 'cancelled') {
    throw new Error('Order already cancelled');
  }
  throw new Error('Cannot cancel order in current status');
}
