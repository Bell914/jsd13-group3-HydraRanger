import dotenv from 'dotenv';
dotenv.config();

import Stripe from 'stripe';

async function testStripeConnection() {
  console.log('==================================================');
  console.log('💳 OCCASION - Testing Stripe Integration');
  console.log('==================================================');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY is missing from server/.env');
    process.exit(1);
  }

  const maskedKey = secretKey.slice(0, 12) + '...' + secretKey.slice(-4);
  console.log(`🔑 Stripe Secret Key: ${maskedKey}`);

  try {
    const stripe = new Stripe(secretKey);
    // Verify connection by calling Stripe API
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe API connection successful!');
    console.log(`📡 Mode: ${balance.livemode ? 'Live' : 'Test Mode'}`);
    console.log('💰 Available Currencies:', balance.available.map(b => b.currency.toUpperCase()).join(', ') || 'N/A');
    console.log('==================================================');
    console.log('🎉 ระบบพร้อมรองรับการชำระเงินผ่าน Stripe เรียบร้อยแล้ว!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Stripe Connection Failed:', error.message);
    process.exit(1);
  }
}

testStripeConnection();
