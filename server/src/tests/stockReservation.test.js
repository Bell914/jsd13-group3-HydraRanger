import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { calculateLookbookDiscount, createOrder } from '../services/orderService.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Lookbook } from '../models/Lookbook.js';

const user = { _id: new mongoose.Types.ObjectId(), email: 'test@example.com' };
const shippingAddress = {
  firstName: 'Test', lastName: 'User', phone: '0800000000',
  address: 'Street', city: 'Bangkok', zipCode: '10100'
};

// A cart can hold the same SKU twice: once on its own and once inside a lookbook set.
// Stock has to be judged on the combined claim, otherwise the first line takes stock
// the second line is then compared against.
function stubProducts(t, products) {
  t.mock.method(Product, 'findOne', async ({ _id }) =>
    products.find((product) => String(product._id) === String(_id)) || null);
  // The set lines carry a lookbookId, so the bundle discount lookup needs an answer
  // instead of waiting on a collection that is not connected in these tests.
  t.mock.method(Lookbook, 'findOne', async () => null);
  t.mock.method(Lookbook, 'findById', async () => null);
}

function stubOrderCreate(t) {
  const created = [];
  t.mock.method(Order, 'create', async (data) => {
    const order = { ...data };
    created.push(order);
    return order;
  });
  t.mock.method(Order, 'findById', (id) => ({
    populate: async () => created.find((order) => String(order._id) === String(id)) || null
  }));
  return created;
}

test('the same SKU on two lines reserves the combined quantity in one update', async (t) => {
  const productId = new mongoose.Types.ObjectId();
  const variantId = new mongoose.Types.ObjectId();
  stubProducts(t, [{
    _id: productId, title: 'Shirt',
    variants: [{ _id: variantId, sku: 'DUP', price: 500, stock_quantity: 10 }]
  }]);
  const stockUpdate = t.mock.method(Product, 'updateOne', async () => ({ modifiedCount: 1 }));
  const created = stubOrderCreate(t);

  await createOrder(user, {
    items: [
      { productId, variantId, sku: 'DUP', quantity: 2 },
      { productId, variantId, sku: 'DUP', quantity: 3, lookbookId: 'look-1' }
    ],
    shippingAddress
  });

  assert.equal(stockUpdate.mock.callCount(), 1, 'one SKU must be reserved once');
  assert.deepEqual(stockUpdate.mock.calls[0].arguments[1], {
    $inc: { 'variants.$.stock_quantity': -5 }
  });
  assert.equal(created[0].items.length, 2, 'both lines are still stored on the order');
});

test('a combined claim larger than the stock is rejected before anything is reserved', async (t) => {
  const productId = new mongoose.Types.ObjectId();
  const variantId = new mongoose.Types.ObjectId();
  stubProducts(t, [{
    _id: productId, title: 'Shirt',
    variants: [{ _id: variantId, sku: 'DUP', price: 500, stock_quantity: 3 }]
  }]);
  const stockUpdate = t.mock.method(Product, 'updateOne', async () => ({ modifiedCount: 1 }));
  const created = stubOrderCreate(t);

  await assert.rejects(
    createOrder(user, {
      items: [
        { productId, variantId, sku: 'DUP', quantity: 2 },
        { productId, variantId, sku: 'DUP', quantity: 2, lookbookId: 'look-1' }
      ],
      shippingAddress
    }),
    /สินค้ามีไม่เพียงพอในสต็อก/
  );

  assert.equal(stockUpdate.mock.callCount(), 0, 'stock must be left untouched');
  assert.equal(created.length, 0);
});

test('rolling back a failed order returns the combined quantity, not one line at a time', async (t) => {
  const productId = new mongoose.Types.ObjectId();
  const dupVariantId = new mongoose.Types.ObjectId();
  const otherVariantId = new mongoose.Types.ObjectId();
  stubProducts(t, [{
    _id: productId, title: 'Shirt',
    variants: [
      { _id: dupVariantId, sku: 'DUP', price: 500, stock_quantity: 10 },
      { _id: otherVariantId, sku: 'OTHER', price: 500, stock_quantity: 1 }
    ]
  }]);

  const calls = [];
  t.mock.method(Product, 'updateOne', async (filter, update) => {
    calls.push({ filter, update });
    // A reservation filters through $elemMatch, a restoration matches the variant directly.
    const variantId = filter.variants?.$elemMatch?._id ?? filter['variants._id'];
    if (String(variantId) === String(otherVariantId)) return { modifiedCount: 0 };
    return { modifiedCount: 1 };
  });
  t.mock.method(Order, 'create', async () => { throw new Error('Order persistence failed'); });

  // The scarce variant fails the reservation, so the duplicated SKU taken first has to
  // be handed back in one update for the two lines combined.
  await assert.rejects(
    createOrder(user, {
      items: [
        { productId, variantId: dupVariantId, sku: 'DUP', quantity: 2 },
        { productId, variantId: dupVariantId, sku: 'DUP', quantity: 3, lookbookId: 'look-1' },
        { productId, variantId: otherVariantId, sku: 'OTHER', quantity: 1 }
      ],
      shippingAddress
    }),
    /สินค้ามีไม่เพียงพอในสต็อก/
  );

  const restores = calls.filter((call) => call.update.$inc['variants.$.stock_quantity'] > 0);
  assert.equal(restores.length, 1, 'the duplicated SKU is given back in a single update');
  assert.deepEqual(restores[0].update, { $inc: { 'variants.$.stock_quantity': 5 } });
  assert.equal(restores[0].filter['variants._id'], dupVariantId);
});

test('lookbook discount requires exactly the configured set items', async (t) => {
  const shirtId = new mongoose.Types.ObjectId();
  const trousersId = new mongoose.Types.ObjectId();
  t.mock.method(Lookbook, 'findOne', async () => ({
    isActive: true,
    saving: 100,
    items: [{ product: shirtId }, { product: trousersId }]
  }));

  const fullSet = [
    { product: shirtId, quantity: 1, lookbookId: 'LOOK-1' },
    { product: trousersId, quantity: 1, lookbookId: 'LOOK-1' }
  ];
  const incompleteSet = [{ product: shirtId, quantity: 1, lookbookId: 'LOOK-1' }];

  assert.equal(await calculateLookbookDiscount(fullSet), 100);
  assert.equal(await calculateLookbookDiscount(incompleteSet), 0);
});
