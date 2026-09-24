import Stripe from 'stripe';
import { Order } from '../models/Order.js';
import * as orderService from '../services/orderService.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createPaymentIntent(req, res, next) {
  try {
    if (!stripe) return res.status(503).json({ success: false, message: 'Stripe is not configured' });
    const userId = req.user._id || req.user.id;
    const order = await Order.findOne({
      _id: req.body.orderId,
      user: userId
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending' || order.paymentMethod !== 'credit-card') {
      return res.status(400).json({ success: false, message: 'Order is not waiting for card payment' });
    }

    // Reuse an existing intent so retrying checkout does not create extra payments.
    if (order.paymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      if (existingIntent.amount !== Math.round(order.totalAmount * 100) || existingIntent.currency !== 'thb') {
        return res.status(400).json({ success: false, message: 'Payment does not match this order' });
      }
      return res.status(200).json({ success: true, clientSecret: existingIntent.client_secret });
    }

    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(order.totalAmount * 100),
        currency: 'thb',
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: String(order._id), userId: String(userId) }
      },
      { idempotencyKey: `occasion-order-${order._id}` }
    );

    // Save the link before returning the client secret or allowing payment confirmation.
    order.paymentIntentId = intent.id;
    await order.save();
    return res.status(200).json({ success: true, clientSecret: intent.client_secret });
  } catch (error) {
    return next(error);
  }
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
      // Metadata lets us find the Order even if the webhook arrives before the
      // paymentIntentId save has finished. The Order already exists at this point.
      const order = await Order.findOne({
        $or: [
          { paymentIntentId: intent.id },
          { _id: intent.metadata?.orderId, user: intent.metadata?.userId }
        ]
      });

      if (!order) return res.status(500).send('Order for payment was not found');

      const expectedAmount = Math.round(order.totalAmount * 100);
      const intentMatchesOrder =
        intent.currency === 'thb' &&
        intent.amount === expectedAmount &&
        String(order.user) === String(intent.metadata?.userId) &&
        (!order.paymentIntentId || order.paymentIntentId === intent.id);

      if (!intentMatchesOrder) return res.status(400).send('Payment does not match the order');

      if (!order.paymentIntentId) {
        order.paymentIntentId = intent.id;
        await order.save();
      }

      if (order.status === 'pending') {
        await orderService.updateOrderStatus(order._id, 'paid');
      }
    } catch (error) {
      console.error('Could not update paid order from Stripe webhook:', error);
      return res.status(500).send('Webhook processing failed');
    }
  }
  return res.json({ received: true });
}
