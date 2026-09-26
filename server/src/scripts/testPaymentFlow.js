import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';

console.log('====================================================');
console.log('💳 OCCASION - Stripe Payment Flow Verification Test');
console.log('====================================================\n');

let allPassed = true;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName} ${extraInfo}`);
  } else {
    console.error(`❌ [FAIL] ${testName} ${extraInfo}`);
    allPassed = false;
  }
}

async function runPaymentTests() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  // 1. Check Configuration
  console.log('--- Step 1: Environment & Keys Check ---');
  assert(Boolean(secretKey), 'STRIPE_SECRET_KEY is present in environment');
  assert(secretKey && secretKey.startsWith('sk_test_'), 'STRIPE_SECRET_KEY is a valid test mode key');

  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    console.error('\n❌ Aborting tests: Invalid or missing STRIPE_SECRET_KEY');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  // 2. Connectivity & Account Check
  console.log('\n--- Step 2: Stripe API Connectivity ---');
  try {
    const balance = await stripe.balance.retrieve();
    assert(true, 'Stripe API connection verified', `(Livemode: ${balance.livemode})`);
  } catch (error) {
    assert(false, 'Stripe API connection', error.message);
    process.exit(1);
  }

  // 3. Create PaymentIntent (Simulating Order Checkout: 890 THB)
  console.log('\n--- Step 3: Create Payment Intent ---');
  let paymentIntentId = null;
  let clientSecret = null;
  const testAmount = 89000; // 890.00 THB in satangs

  try {
    const intent = await stripe.paymentIntents.create({
      amount: testAmount,
      currency: 'thb',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      description: 'OCCASION Test Order #TEST-001',
      metadata: {
        orderId: 'test-order-001',
        source: 'Automated-Verification-Script',
      },
    });

    paymentIntentId = intent.id;
    clientSecret = intent.client_secret;

    assert(Boolean(intent.id), 'PaymentIntent created successfully', `(ID: ${intent.id})`);
    assert(intent.amount === testAmount, 'PaymentIntent amount matches 890.00 THB');
    assert(intent.currency === 'thb', 'Currency is THB');
    assert(intent.status === 'requires_payment_method', 'Initial status is requires_payment_method');
  } catch (error) {
    assert(false, 'Create PaymentIntent', error.message);
    process.exit(1);
  }

  // 4. Confirm Payment with Test Card (pm_card_visa)
  console.log('\n--- Step 4: Confirm Payment with Stripe Test Card ---');
  try {
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: 'pm_card_visa',
    });

    assert(confirmedIntent.status === 'succeeded', 'Payment confirmed successfully', `(Status: ${confirmedIntent.status})`);
    assert(confirmedIntent.amount_received === testAmount, 'Amount received matches expected total', `(890.00 THB)`);
  } catch (error) {
    assert(false, 'Confirm PaymentIntent with test card', error.message);
  }

  // 5. Test Cancellation Flow on Unpaid Intent
  console.log('\n--- Step 5: Test Cancellation Flow (User Aborts / Timeout) ---');
  try {
    const intentToCancel = await stripe.paymentIntents.create({
      amount: 45000,
      currency: 'thb',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: 'OCCASION Cancel Test',
    });

    const cancelledIntent = await stripe.paymentIntents.cancel(intentToCancel.id);
    assert(cancelledIntent.status === 'canceled', 'Unpaid intent cancelled cleanly', `(ID: ${cancelledIntent.id})`);
  } catch (error) {
    assert(false, 'Cancel PaymentIntent', error.message);
  }

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL PAYMENT TESTS PASSED! ระบบชำระเงินทำงานได้สมบูรณ์แบบ');
  } else {
    console.log('⚠️ SOME TESTS FAILED. โปรดตรวจสอบข้อความแจ้งเตือนด้านบน');
  }
  console.log('====================================================\n');
}

runPaymentTests();
