import mongoose from 'mongoose';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';

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
  const shippingMethod = orderData.shippingMethod || 'standard';
  const shippingCost = getShippingCost(shippingMethod);
  const taxAmount = Math.round(subtotal * 0.06 * 100) / 100;

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
      shippingMethod,
      paymentMethod: orderData.paymentMethod || 'credit-card',
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount: subtotal + shippingCost + taxAmount,
      stockReserved: true
    });
  } catch (error) {
    await restoreOrderStock(items);
    throw error;
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

  if (status === 'cancelled') {
    const cancelledOrder = await Order.findOneAndUpdate(
      { _id: orderId, status: { $ne: 'cancelled' } },
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );

    if (cancelledOrder) {
      if (cancelledOrder.stockReserved && !cancelledOrder.stockRestored) {
        await restoreOrderStock(cancelledOrder.items);
      }
      cancelledOrder.stockRestored = true;
      await cancelledOrder.save();
      return cancelledOrder.populate('user', 'username email');
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) throw new Error('Order not found');
    return existingOrder.populate('user', 'username email');
  }

  const order = await Order.findByIdAndUpdate(
    { _id: orderId, status: { $ne: 'cancelled' } },
    { status },
    { new: true, runValidators: true }
  ).populate('user', 'username email');

  if (!order) {
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) throw new Error('Order not found');
    throw new Error('Cancelled order status cannot be changed');
  }
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
    return order.save();
  }

  const existingOrder = await getOrderById(orderId, userId);

  if (existingOrder.status === 'cancelled') {
    throw new Error('Order already cancelled');
  }
  throw new Error('Cannot cancel order in current status');
}
