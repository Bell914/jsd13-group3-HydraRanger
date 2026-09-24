import Stripe from 'stripe';
import { Order } from '../models/Order.js';
import * as orderService from '../services/orderService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createPaymentIntent(req, res, next) {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Stripe is not configured' });
    const amount = Number(req.body.amount);
    if (!Number.isInteger(amount) || amount < 50) return res.status(400).json({ success: false, message: 'Amount must be an integer of at least 50 satang' });
    const intent = await stripe.paymentIntents.create({ amount, currency: 'thb', automatic_payment_methods: { enabled: true }, metadata: { userId: String(req.user._id || req.user.id) } });
    res.status(200).json({ success: true, clientSecret: intent.client_secret });
  } catch (error) { next(error); }
}

export async function bindPaymentIntent(req, res, next) {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Stripe is not configured' });
    const { paymentIntentId, orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id || req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded' || intent.currency !== 'thb' || intent.amount !== Math.round(order.totalAmount * 100)) {
      return res.status(400).json({ success: false, message: 'Payment does not match this order' });
    }
    order.paymentIntentId = intent.id;
    await order.save();
    return res.status(200).json({ success: true });
  } catch (error) { return next(error); }
}

export async function stripeWebhook(req, res) {
  if (!stripe) return res.status(503).send('Stripe is not configured');
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) { return res.status(400).send(`Webhook Error: ${error.message}`); }
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    try {
      const order = await Order.findOne({ paymentIntentId: intent.id });
      if (order && order.status === 'pending') await orderService.updateOrderStatus(order._id, 'paid');
    } catch (error) { console.error('Could not update paid order from Stripe webhook:', error); return res.status(500).send('Webhook processing failed'); }
  }
  return res.json({ received: true });
}
