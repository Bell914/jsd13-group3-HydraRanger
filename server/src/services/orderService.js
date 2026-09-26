import mongoose from 'mongoose';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Lookbook } from '../models/Lookbook.js';
import * as loyaltyService from './loyaltyService.js';
import {
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  VALID_COUPONS,
  SHIPPING_METHODS_CONFIG
} from '../config/membershipConfig.js';
import { refundCouponUsage, claimCouponAtomically, getActiveGeneralCoupon } from './couponService.js';

const SHIPPING_COSTS = {
  standard: 0,
  express: 50,
  priority: 100
};

const ALLOWED_STATUS_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['completed', 'refunded'],
  completed: ['refunded'],
  cancelled: [],
  refunded: []
};

export function canTransitionOrderStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  return (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}

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
      throw new Error(variant.stock_quantity <= 0 ? 'สินค้าหมดแล้ว' : 'สินค้ามีไม่เพียงพอในสต็อก');
    }

    preparedItems.push({
      product: product._id,
      variantId: variant._id,
      sku: variant.sku,
      title: product.title,
      variant: variant.size_or_color,
      color: variant.color || '',
      size: variant.size || '',
      imageUrl: getImageUrl(product),
      unitPrice: variant.price,
      quantity,
      lineTotal: variant.price * quantity,
      lookbookId: item.lookbookId ? String(item.lookbookId).trim() : ''
    });
  }

  return preparedItems;
}

export async function calculateLookbookDiscount(items) {
  const lookbookGroups = {};
  for (const item of items) {
    if (item.lookbookId) {
      const key = String(item.lookbookId).trim();
      if (!lookbookGroups[key]) {
        lookbookGroups[key] = [];
      }
      lookbookGroups[key].push(item);
    }
  }

  let totalLookbookDiscount = 0;

  for (const [lbId, groupItems] of Object.entries(lookbookGroups)) {
    try {
      const lookbook = mongoose.Types.ObjectId.isValid(lbId)
        ? await Lookbook.findById(lbId)
        : await Lookbook.findOne({
            $or: [
              { lookbookId: lbId },
              { lookbookId: lbId.toUpperCase() },
              { lookbookId: lbId.toLowerCase() },
            ],
          });

      if (lookbook && lookbook.isActive !== false) {
        const saving = Number(lookbook.saving) > 0
          ? Number(lookbook.saving)
          : Math.max(0, Number(lookbook.regularPrice || 0) - Number(lookbook.setPrice || 0));

        if (saving > 0) {
          if (Array.isArray(lookbook.items) && lookbook.items.length > 0) {
            const productIds = lookbook.items.map((it) => String(it.product?._id || it.product));
            const productCounts = productIds.map((pId) => {
              const matched = groupItems.filter((gi) => String(gi.product) === pId);
              return matched.reduce((sum, gi) => sum + gi.quantity, 0);
            });
            const completeSets = Math.min(...productCounts);
            if (completeSets > 0) {
              totalLookbookDiscount += saving * completeSets;
            }
          } else {
            const minQty = Math.min(...groupItems.map((gi) => gi.quantity));
            if (minQty > 0 && groupItems.length >= 2) {
              totalLookbookDiscount += saving * minQty;
            }
          }
        }
      }
    } catch (err) {
      console.warn(`Could not compute lookbook discount for ${lbId}:`, err.message);
    }
  }

  return totalLookbookDiscount;
}

function wasUpdated(result) {
  return (result.modifiedCount ?? result.nModified ?? 0) === 1;
}

async function restoreOrderStock(items, session = null) {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product, 'variants._id': item.variantId },
      { $inc: { 'variants.$.stock_quantity': item.quantity } },
      session ? { session } : undefined
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
        throw new Error('สินค้ามีไม่เพียงพอในสต็อก');
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
  // Capture the checkout start once so time-based fields belong to the same
  // request, even when inventory preparation takes a little while.
  const checkoutStartedAt = new Date();
  validateShippingAddress(orderData.shippingAddress);
  const items = await prepareOrderItems(orderData.items);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  // 1. Calculate Lookbook Set Bundle Discount
  const lookbookDiscount = await calculateLookbookDiscount(items);
  const effectiveSubtotal = Math.max(0, subtotal - lookbookDiscount);

  // 2. Calculate discount from member tier
  const membershipTierAtPurchase = user?.membership?.rank || 'MEMBER';
  const rankPercent = RANK_DISCOUNT_PERCENT[membershipTierAtPurchase] || 0;
  let calculatedDiscount = rankPercent > 0 ? Math.round((effectiveSubtotal * rankPercent) / 100) : 0;

  // 3. Validate coupon if provided
  const couponCode = orderData.couponCode ? String(orderData.couponCode).trim().toUpperCase() : '';
  let appliedDbCoupon = null;
  const orderId = new mongoose.Types.ObjectId();
  if (couponCode) {
    // 2.1 First attempt atomic claim on dynamic user coupons in MongoDB (e.g. WELCOME5)
    const userId = user?._id || user?.id;
    if (userId) {
      try {
        appliedDbCoupon = await claimCouponAtomically({
          code: couponCode,
          userId,
          orderId,
        });
        if (appliedDbCoupon) {
          const couponDiscount = Math.round((effectiveSubtotal * appliedDbCoupon.discountValue) / 100);
          calculatedDiscount = Math.max(calculatedDiscount, couponDiscount);
        }
      } catch (couponErr) {
        console.warn('Coupon atomic claim warning:', couponErr.message);
      }
    }

    // 2.2 Fallback to static VALID_COUPONS (Tier coupons, birthday coupons)
    if (!appliedDbCoupon) {
      const coupon = await getActiveGeneralCoupon(couponCode, effectiveSubtotal) || VALID_COUPONS[couponCode];
      if (coupon) {
        if (effectiveSubtotal >= (coupon.minSpend || 0)) {
          if (coupon.type === 'GENERAL') {
            const couponDiscount = Math.round((effectiveSubtotal * coupon.discountValue) / 100);
            calculatedDiscount = Math.max(calculatedDiscount, couponDiscount);
          } else if (coupon.type === 'percent') {
            const couponDiscount = Math.round((effectiveSubtotal * coupon.value) / 100);
            calculatedDiscount = Math.max(calculatedDiscount, couponDiscount);
          } else if (coupon.type === 'fixed') {
            calculatedDiscount = Math.max(calculatedDiscount, coupon.value);
          }
        }
      } else {
        throw new Error('คูปองไม่ถูกต้อง หรือถูกใช้งานไปแล้ว');
      }
    }
  }
  const discountAmount = Math.min(subtotal, lookbookDiscount + calculatedDiscount);

  // 4. Calculate shipping cost based on shipping method and free shipping rules
  const methodKey = String(orderData.shippingMethod || 'standard').toLowerCase();
  const selectedMethod = SHIPPING_METHODS_CONFIG[methodKey] || SHIPPING_METHODS_CONFIG.standard;
  const baseShippingCost = selectedMethod.price;

  const freeShippingThreshold = FREE_SHIPPING_MINIMUM[membershipTierAtPurchase] ?? 1000;
  const isFreeShipping = freeShippingThreshold === 0 || effectiveSubtotal >= freeShippingThreshold;

  let shippingCost = baseShippingCost;
  if (methodKey === 'standard') {
    shippingCost = isFreeShipping ? 0 : 50;
  } else if (membershipTierAtPurchase === 'PLATINUM' && methodKey === 'priority') {
    shippingCost = 0; // Platinum priority shipping is free
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const totalAmount = discountedSubtotal + shippingCost;
  const paymentMethod = orderData.paymentMethod || 'credit-card';
  const paymentExpiresAt = ['credit-card', 'promptpay', 'paypal'].includes(paymentMethod)
    ? new Date(checkoutStartedAt.getTime() + 30 * 60 * 1000)
    : null;

  let order;
  let stockReserved = false;
  try {
    await reserveOrderStock(items);
    stockReserved = true;
    order = await Order.create({
      _id: orderId,
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
      paymentMethod,
      paymentIntentId: orderData.paymentIntentId || '',
      paymentExpiresAt,
      subtotal,
      discountAmount,
      couponCode,
      membershipTierAtPurchase,
      shippingCost,
      totalAmount,
      loyaltyProcessed: false,
      stockReserved: true
    });
  } catch (error) {
    try {
      if (stockReserved) await restoreOrderStock(items);
    } finally {
      // Only release the claim owned by this failed checkout, including stock failures.
      if (appliedDbCoupon) {
        await refundCouponUsage({ code: couponCode, userId: user._id || user.id, orderId });
      }
    }
    throw error;
  }

  return Order.findById(order._id).populate('user', 'username email');
}

export async function getExpiredPendingPaymentOrders(now = new Date()) {
  const oldOrderCutoff = new Date(now.getTime() - 30 * 60 * 1000);

  return Order.find({
    status: 'pending',
    paymentMethod: { $in: ['credit-card', 'promptpay', 'paypal'] },
    $or: [
      { paymentExpiresAt: { $lte: now } },
      {
        paymentMethod: 'credit-card',
        paymentExpiresAt: null,
        createdAt: { $lte: oldOrderCutoff }
      }
    ]
  });
}

export async function getMyOrders(userId) {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return orders.map((order) => ({
    ...order,
    userId: String(order.user),
    items: order.items.map((item) => ({
      ...item,
      productId: String(item.product),
      name: item.title,
      price: item.unitPrice,
      color: item.color || '',
      size: item.size || ''
    }))
  }));
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

function isTransactionUnavailable(error) {
  return error?.code === 20 || /transaction numbers are only allowed/i.test(error?.message || '');
}

async function applyOrderStatusChanges(existingOrder, status, userId, netSpend, session = null) {
  if (['cancelled', 'refunded'].includes(status) && existingOrder.stockReserved && !existingOrder.stockRestored) {
    await restoreOrderStock(existingOrder.items, session);
    existingOrder.stockRestored = true;
  }

  if (userId && !existingOrder.loyaltyProcessed && status === 'paid') {
    await loyaltyService.processOrderSpending(userId, netSpend, 'ADD', session);
    existingOrder.loyaltyProcessed = true;
  } else if (userId && existingOrder.loyaltyProcessed && ['cancelled', 'refunded'].includes(status)) {
    await loyaltyService.processOrderSpending(userId, netSpend, 'SUBTRACT', session);
    existingOrder.loyaltyProcessed = false;
  }

  await existingOrder.save(session ? { session } : undefined);
}

export async function updateOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid order status');

  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) throw new Error('Order not found');

  if (status === existingOrder.status) return existingOrder.populate('user', 'username email');

  if (!canTransitionOrderStatus(existingOrder.status, status)) {
    throw new Error(`Order status cannot change from ${existingOrder.status} to ${status}`);
  }

  existingOrder.status = status;

  const userId = existingOrder.user?._id || existingOrder.user?.id || existingOrder.user;
  const netSpend = Math.max(0, existingOrder.subtotal - (existingOrder.discountAmount || 0));

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    await applyOrderStatusChanges(existingOrder, status, userId, netSpend, session);
    await session.commitTransaction();
  } catch (error) {
    await session?.abortTransaction();

    if (!session || isTransactionUnavailable(error)) {
      await applyOrderStatusChanges(existingOrder, status, userId, netSpend);
    } else {
      throw error;
    }
  } finally {
    await session?.endSession();
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

  const existingOrder = await getOrderById(orderId, userId);

  if (existingOrder.status === 'cancelled') {
    throw new Error('Order already cancelled');
  }
  if (!['pending', 'paid'].includes(existingOrder.status)) {
    throw new Error('Cannot cancel order in current status');
  }

  // Keep stock and loyalty changes in one status-transition path.
  return updateOrderStatus(orderId, 'cancelled');
}

