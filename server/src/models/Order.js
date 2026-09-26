import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sku: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    variant: { type: String, required: true, trim: true },
    color: { type: String, default: '', trim: true },
    size: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    lookbookId: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'Thailand', trim: true },
    deliveryNote: { type: String, default: '', trim: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'At least one order item is required'
      }
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    shippingMethod: { type: String, default: 'standard', trim: true },
    paymentMethod: { type: String, default: 'credit-card', trim: true },
    paymentIntentId: { type: String, default: '', index: true },
    paymentExpiresAt: { type: Date, default: null, index: true },
    paymentSetupStartedAt: { type: Date, default: null },
    paymentCancellationRequested: { type: Boolean, default: false },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '', trim: true },
    membershipTierAtPurchase: { type: String, default: 'MEMBER', trim: true },
    shippingCost: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    loyaltyProcessed: { type: Boolean, default: false, index: true },
    stockReserved: { type: Boolean, default: false },
    stockRestored: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
