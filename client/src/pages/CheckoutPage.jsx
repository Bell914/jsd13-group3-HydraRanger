import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import { useAddressStore } from "../store/addressStore.js";
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

// ➕ HIGHLIGHT: Import createOrder จาก orderService (ซึ่งภายในใช้ api.post ของทีม เพื่อส่ง token อัตโนมัติ)[cite: 6, 12]
import { createOrder } from "../services/orderService";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const addAddress = useAddressStore((state) => state.addAddress);
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

  const [submitError, setSubmitError] = useState(null);

  const subtotal = getTotalPrice();

  // Calculate order total for final order placement
  const selectedShipping =
    SHIPPING_METHODS.find((m) => m.id === shippingData.shippingMethod) ||
    SHIPPING_METHODS[0];
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const taxAmount = currentStep >= 3 ? Math.round(subtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Handle Place Order
  // ✏️ HIGHLIGHT (UPDATE): ปรับแก้ไข Syntax try/catch ให้ถูกต้อง และเรียกใช้ createOrder ผ่าน api.post
const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null); // ➕ ล้างข้อความ Error เก่าก่อนยิง Request ใหม่

try {
      // ➕ 1. จัดเตรียม Payload ทั้ง 6 ส่วนตามโครงสร้างที่ Backend กำหนด
      const orderPayload = {
        email: email,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
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
          state: shippingData.state,
          zipCode: shippingData.zipCode,
          location: shippingData.location,
        },
        shippingMethod: shippingData.shippingMethod,
        paymentMethod: paymentData.method,
        shippingCost: shippingCost,
      };

      // ➕ 2. ยิง API POST /api/orders
      const responseData = await createOrder(orderPayload);

      // ➕ 3. เมื่อสั่งซื้อสำเร็จ: เก็บข้อมูล Order ที่ได้จาก Server และล้างตะกร้าสินค้า
// ➕ เพิ่มการบันทึกที่อยู่หากผู้ใช้เช็คเลือก "Save address"
      if (shippingData.saveAddress && addAddress) {
        addAddress({
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          phone: shippingData.phone,
          address: shippingData.address,
          city: shippingData.city,
          state: shippingData.state,
          zipCode: shippingData.zipCode,
        });
      }

      setCompletedOrder({
        orderId: responseData?.orderNumber || responseData?.orderId || `OCC-${Math.floor(100000 + Math.random() * 900000)}`,
        email: responseData?.customerEmail || email,
        shippingData: {
          ...(responseData?.shippingAddress || shippingData),
          shippingMethod:
            responseData?.shippingMethod || shippingData.shippingMethod,
        },
        items: (responseData?.items || cartItems).map((item) => ({
          ...item,
          name: item.title || item.name,
          price: item.unitPrice || item.price,
        })),
        subtotal: responseData?.subtotal || subtotal,
        shippingCost: responseData?.shippingCost || shippingCost,
        taxAmount: responseData?.taxAmount || taxAmount,
        totalAmount: responseData?.totalAmount || totalAmount,
      });

      clearCart(); // ล้างตะกร้าใน Zustand & LocalStorage

    } catch (err) {
     // ➕ 4. แสดงข้อความแจ้งเตือนเมื่อเกิดปัญหา (Corrected try/catch syntax)
console.error("Failed to place order:", err);
      // ✏️ ปรับการอ่าน Error ให้ตรงตาม ApiClient ของทีม
      setSubmitError(
        err.data?.message || err.message || "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง"
      );
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

{/* ➕ HIGHLIGHT: แสดงกล่อง Error Message หากยิง API ไม่สำเร็จ */}
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