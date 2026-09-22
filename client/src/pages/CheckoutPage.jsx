import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import { authService } from "../services/authService";
import { getAddresses } from "../services/userService";
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
  const currentUser = authService.getCurrentUser();

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

  const subtotal = getTotalPrice();

  // Calculate order total for final order placement
  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === shippingData.shippingMethod) ||
    SHIPPING_METHODS[0];
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const taxAmount = currentStep >= 3 ? Math.round(subtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Handle Place Order
  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    const itemsSnapshot = [...cartItems];
    setTimeout(() => {
      const orderId = `OCC-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedOrder({
        orderId,
        shippingData,
        email,
        items: itemsSnapshot,
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
      });
      clearCart();
      setIsSubmitting(false);
    }, 800);
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}