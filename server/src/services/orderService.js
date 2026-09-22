import mongoose from 'mongoose';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import * as loyaltyService from './loyaltyService.js';

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
  const discountAmount = Number(orderData.discountAmount) || 0;
  const couponCode = orderData.couponCode ? String(orderData.couponCode).trim() : '';
  const membershipTierAtPurchase = user?.membership?.rank || 'MEMBER';
  const shippingCost = Number(orderData.shippingCost) || 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.06 * 100) / 100;
  const totalAmount = taxableSubtotal + shippingCost + taxAmount;

  const order = await Order.create({
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
    loyaltyProcessed: false
  });

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

  const previousStatus = existingOrder.status;
  existingOrder.status = status;

  // Trigger Loyalty Program rank and spending update with duplicate protection (Idempotency)
  try {
    const userId = existingOrder.user?._id || existingOrder.user?.id || existingOrder.user;
    const netSpend = Math.max(0, existingOrder.subtotal - (existingOrder.discountAmount || 0));

    if (userId && !existingOrder.loyaltyProcessed && ['paid', 'completed'].includes(status)) {
      await loyaltyService.processOrderSpending(userId, netSpend, 'ADD');
      existingOrder.loyaltyProcessed = true;
    } else if (userId && existingOrder.loyaltyProcessed && ['cancelled', 'refunded'].includes(status)) {
      await loyaltyService.processOrderSpending(userId, netSpend, 'SUBTRACT');
      existingOrder.loyaltyProcessed = false;
    }
  } catch (err) {
    console.error('Failed to trigger loyalty update for order:', err);
  }

  await existingOrder.save();

  const order = await Order.findById(orderId).populate('user', 'username email');
  return order;
}