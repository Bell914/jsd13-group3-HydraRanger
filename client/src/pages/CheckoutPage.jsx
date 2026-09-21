import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import { useAddressStore } from "../store/addressStore.js";
import { authService } from "../services/authService";
import { useAuth } from "../context/Auth/useAuth.jsx";
import {
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  calculateRankFromSpending
} from "../utils/loyaltyUtils.js";
import {
  CheckoutStepper,
  ContactSection,
  ShippingSection,
  PaymentSection,
  ReviewSection,
  OrderSummary,
  OrderSuccessModal,
  OrderConfirmationScreen,
  SHIPPING_METHODS,
} from "../components/checkout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const addAddress = useAddressStore((state) => state.addAddress);

  let authUser = null;
  let updateProfile = null;
  try {
    const auth = useAuth();
    authUser = auth?.user;
    updateProfile = auth?.updateProfile;
  } catch {
    authUser = authService.getCurrentUser();
  }
  const currentUser = authUser || authService.getCurrentUser();

  // Current Step: 1 = Contact, 2 = Shipping, 3 = Payment, 4 = Review
  // Default to step 2 as shown in the primary wireframe, or step 1 if no email
  const [currentStep, setCurrentStep] = useState(2);

  // Contact Form State
  const [email, setEmail] = useState(currentUser?.email || "");

  // Shipping Form State (pre-populated with wireframe sample values for seamless demo)
  const [shippingData, setShippingData] = useState({
    location: "Thailand",
    firstName: "สมชาย",
    lastName: "ใจดี",
    phone: "0812345678",
    address: "123/45 ซอยสุขุมวิท 21 ถนนสุขุมวิท",
    deliveryNote: "",
    city: "เขตวัฒนา",
    state: "Bangkok",
    zipCode: "10110",
    saveAddress: false,
    shippingMethod: "standard",
    isGift: false,
    giftMessage: "",
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    method: "credit-card",
    cardNumber: "4111 2222 3333 4444",
    cardExp: "12/28",
    cardCvv: "123",
  });

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotal = getTotalPrice();

  // Loyalty Rank Discount & Free Shipping Calculations
  const userRank = currentUser?.membership?.rank || 'MEMBER';
  const discountPercent = RANK_DISCOUNT_PERCENT[userRank] || 0;
  const rankDiscountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const isFreeShipping = FREE_SHIPPING_MINIMUM[userRank] === 0 || subtotal >= (FREE_SHIPPING_MINIMUM[userRank] ?? 1000);

  // Calculate order total for final order placement
  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === shippingData.shippingMethod) ||
    SHIPPING_METHODS[0];
  const shippingCost = isFreeShipping ? 0 : (selectedShipping ? selectedShipping.price : 0);
  const discountedSubtotal = Math.max(0, subtotal - rankDiscountAmount);
  const taxAmount = currentStep >= 3 ? Math.round(discountedSubtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = discountedSubtotal + shippingCost + taxAmount;

  // Handle Place Order
  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    if (shippingData.saveAddress) {
      const { firstName, lastName, phone, address, city, state, zipCode, location } = shippingData;
      addAddress({ firstName, lastName, phone, address, city, state, zipCode, location });
    }
    const itemsSnapshot = [...cartItems];

    // Update user loyalty points/spending and rank
    if (currentUser && updateProfile) {
      const currentSpending = Number(currentUser.membership?.accumulatedSpending || 0);
      const newSpending = currentSpending + discountedSubtotal;
      const newRank = calculateRankFromSpending(newSpending);
      updateProfile({
        membership: {
          ...currentUser.membership,
          accumulatedSpending: newSpending,
          rank: newRank,
          rankUpdatedAt: new Date()
        }
      }).catch((err) => console.warn("Could not update loyalty rank:", err));
    }

    setTimeout(() => {
      const orderId = `OCC-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedOrder({
        orderId,
        shippingData,
        email,
        items: itemsSnapshot,
        subtotal,
        rankDiscountAmount,
        userRank,
        shippingCost,
        taxAmount,
        totalAmount,
      });
      clearCart();
      setIsSubmitting(false);
    }, 100);
  };

  // If order is completed, show full Order Confirmation Screen (Receipt Screen from Image 1)
  if (completedOrder) {
    return <OrderConfirmationScreen orderData={completedOrder} />;
  }

  // If cart is empty and no completed order, show empty cart view
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Stepper Header */}
        <CheckoutStepper
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-2 space-y-4">
            {/* STEP 1: Contact (Active when step 1) */}
            {currentStep === 1 && (
              <ContactSection
                email={email}
                onChangeEmail={setEmail}
                isCollapsed={false}
                onContinue={() => setCurrentStep(2)}
                onBack={() => navigate("/cart")}
              />
            )}

            {/* STEP 2: Shipping (Active when step 2) */}
            {currentStep === 2 && (
              <>
                <ContactSection
                  email={email}
                  isCollapsed={true}
                  onEdit={() => setCurrentStep(1)}
                />
                <ShippingSection
                  shippingData={shippingData}
                  onChangeShipping={setShippingData}
                  isCollapsed={false}
                  onContinue={() => setCurrentStep(3)}
                  onBack={() => navigate("/cart")}
                />
              </>
            )}

            {/* STEP 3: Payment (Active when step 3) */}
            {currentStep === 3 && (
              <>
                <ContactSection
                  email={email}
                  isCollapsed={true}
                  onEdit={() => setCurrentStep(1)}
                />
                <ShippingSection
                  shippingData={shippingData}
                  isCollapsed={true}
                  onEdit={() => setCurrentStep(2)}
                />
                <PaymentSection
                  paymentData={paymentData}
                  onChangePayment={setPaymentData}
                  isCollapsed={false}
                  onContinue={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              </>
            )}

            {/* STEP 4: Review (Active when step 4) */}
            {currentStep === 4 && (
              <ReviewSection
                email={email}
                shippingData={shippingData}
                paymentData={paymentData}
                onEditStep={(step) => setCurrentStep(step)}
                onBack={() => setCurrentStep(3)}
                onPlaceOrder={handlePlaceOrder}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shippingMethodId={shippingData.shippingMethod}
              currentStep={currentStep}
              userRank={userRank}
              rankDiscountAmount={rankDiscountAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}