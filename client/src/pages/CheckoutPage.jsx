import React, { useState, useEffect } from "react";
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
import { getAddresses } from "../services/userService";
import { createOrder } from "../services/orderService.js";
import { couponService } from "../services/couponService.js";
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
  const [currentStep, setCurrentStep] = useState(2);

  // Contact Form State
  const [email, setEmail] = useState(currentUser?.email || "");

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    location: "Thailand",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    deliveryNote: "",
    city: "",
    state: "",
    zipCode: "",
    saveAddress: false,
    shippingMethod: "standard",
    isGift: false,
    giftMessage: "",
  });

  // Saved addresses list from Backend
  const [savedAddresses, setSavedAddresses] = useState([]);

  // ดึงข้อมูลที่อยู่จัดส่งของผู้ใช้ที่บันทึกไว้เมื่อเปิดหน้า Checkout
  useEffect(() => {
    fetchUserAddresses();
  }, []);

  const fetchUserAddresses = async () => {
    try {
      const res = await getAddresses();
      const addrList = res.data || (Array.isArray(res) ? res : []);
      setSavedAddresses(addrList);

      if (addrList.length > 0) {
        // เลือกที่อยู่หลัก (isDefault) หรือที่อยู่อันแรกสุดถ้าไม่มีหลัก
        const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
        if (defaultAddr) {
          // แยกชื่อผู้รับถ้าเป็นฟิลด์เดียว
          const nameParts = (defaultAddr.recipientName || "").trim().split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setShippingData((prev) => ({
            ...prev,
            firstName: firstName || prev.firstName,
            lastName: lastName || prev.lastName,
            phone: defaultAddr.phone || prev.phone,
            address: defaultAddr.addressLine || prev.address,
            city: defaultAddr.district || prev.city,
            state: defaultAddr.province || prev.state,
            zipCode: defaultAddr.postalCode || prev.zipCode,
          }));
        }
      }
    } catch (err) {
      console.warn("Could not load saved shipping addresses:", err.message);
    }
  };

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    method: "credit-card",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
  });

  // Order Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [orderError, setOrderError] = useState("");
  const [submitError, setSubmitError] = useState(null);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

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
  
  const couponDiscountAmount = appliedCoupon
    ? (appliedCoupon.discountAmount || Math.round((subtotal * (appliedCoupon.discountValue || 5)) / 100))
    : 0;
  const totalDiscount = Math.max(rankDiscountAmount, couponDiscountAmount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxAmount = currentStep >= 3 ? Math.round(discountedSubtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = discountedSubtotal + shippingCost + taxAmount;

  const handleApplyCoupon = async (code) => {
    try {
      setCouponLoading(true);
      setCouponError("");
      const res = await couponService.validateCoupon(code, subtotal);
      if (res?.data || res?.valid) {
        const couponData = res.data || res;
        setAppliedCoupon(couponData);
        setCouponError("");
      } else {
        setCouponError(res?.message || "โค้ดส่วนลดไม่ถูกต้อง");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.message || "ไม่สามารถตรวจสอบโค้ดส่วนลดได้");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setOrderError("");
    setSubmitError(null);

    if (shippingData.saveAddress && addAddress) {
      const { firstName, lastName, phone, address, city, state, zipCode, location } = shippingData;
      addAddress({
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        location: location || "Thailand",
      });
    }
    const itemsSnapshot = [...cartItems];

    const orderPayload = {
      email: email || currentUser?.email,
      items: cartItems.map((item) => ({
        productId: item.productId || item._id || item.product_id,
        variantId: item.variantId || item.variant_id,
        sku: item.sku || "",
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        phone: shippingData.phone,
        address: shippingData.address,
        city: shippingData.city,
        state: shippingData.state || '',
        zipCode: shippingData.zipCode,
        location: shippingData.location || 'Thailand',
        deliveryNote: shippingData.deliveryNote || ''
      },
      shippingMethod: shippingData.shippingMethod || 'standard',
      paymentMethod: paymentData.method || 'credit-card',
      shippingCost: shippingCost,
      couponCode: appliedCoupon?.code || shippingData.couponCode || ''
    };

    try {
      const res = await createOrder(orderPayload);
      const created = res?.data || res;

      let upgradedRank = null;
      if (currentUser) {
        const currentSpending = Number(currentUser.membership?.accumulatedSpending || 0);
        const newSpending = currentSpending + (created?.subtotal ?? discountedSubtotal);
        const newRank = calculateRankFromSpending(newSpending);
        if (newRank !== userRank) {
          upgradedRank = newRank;
        }
      }

      setCompletedOrder({
        orderId: created.orderNumber || created.orderId || created._id || `OCC-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingData: {
          ...(created?.shippingAddress || shippingData),
          shippingMethod: created?.shippingMethod || shippingData.shippingMethod,
        },
        email: created.customerEmail || orderPayload.email,
        items: (created.items || itemsSnapshot).map((item) => ({
          ...item,
          name: item.title || item.name || item.productName,
          price: item.unitPrice || item.price,
        })),
        subtotal: created.subtotal ?? subtotal,
        rankDiscountAmount: created.discountAmount ?? rankDiscountAmount,
        userRank,
        upgradedRank,
        shippingCost: created.shippingCost ?? shippingCost,
        taxAmount: created.taxAmount ?? taxAmount,
        totalAmount: created.totalAmount ?? totalAmount,
      });

      clearCart();
    } catch (err) {
      console.error("Order creation failed:", err);
      const msg =
        err.data?.message ||
        err.response?.data?.message ||
        err.message ||
        "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง";
      setOrderError(msg);
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is completed, show full Order Confirmation Screen
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

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between items-center">
            <span>{submitError}</span>
            <button 
              onClick={() => setSubmitError(null)}
              className="text-red-500 font-bold hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

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
                  savedAddresses={savedAddresses}
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
              <>
                {orderError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {orderError}
                  </div>
                )}
                <ReviewSection
                  email={email}
                  shippingData={shippingData}
                  paymentData={paymentData}
                  onEditStep={(step) => setCurrentStep(step)}
                  onBack={() => setCurrentStep(3)}
                  onPlaceOrder={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                />
              </>
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
              appliedCoupon={appliedCoupon}
              couponDiscountAmount={couponDiscountAmount}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}