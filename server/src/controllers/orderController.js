import { HTTP_STATUS } from '../config/constants.js';
import * as orderService from '../services/orderService.js';

function sendOrderError(error, res, next) {
  const badRequestMessages = [
    'Order must contain',
    'Invalid product',
    'Order quantity',
    'Product in order',
    'Variant for',
    'Not enough stock',
    'สินค้ามีไม่เพียงพอในสต็อก',
    'สินค้าหมดแล้ว',
    'Invalid order status',
    'Missing shipping fields',
    'Order already cancelled',
    'Cannot cancel order',
    'Invalid shipping method',
    'Cancelled order status',
    'Order status cannot change'
  ];

  if (badRequestMessages.some((message) => error.message.startsWith(message))) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
  }
  if (error.message === 'Order not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  return next(error);
}

export async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    sendOrderError(error, res, next);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getMyOrders(req.user._id || req.user.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

// เพิ่มฟังก์ชันสำหรับกดดู Order Detail รายการเดียว
export async function getMyOrderDetail(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const orderId = req.params.id;
    const order = await orderService.getOrderById(orderId, userId);
    
    res.status(HTTP_STATUS.OK).json({ success: true, data: order });
  } catch (error) {
    sendOrderError(error, res, next);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const orderId = req.params.id;
    const order = await orderService.cancelOrder(userId, orderId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    sendOrderError(error, res, next);
  }
}

export async function getAdminOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.status(HTTP_STATUS.OK).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    sendOrderError(error, res, next);
  }
}
