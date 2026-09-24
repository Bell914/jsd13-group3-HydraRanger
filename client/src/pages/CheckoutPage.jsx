import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useCartStore from "../store/cartStore";
import { useAddressStore } from "../store/addressStore.js";
import { authService } from "../services/authService";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { getAddresses, addAddress } from "../services/userService.js";
import { createOrder } from "../services/orderService.js";
import { api } from "../services/api.js";
import {
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  calculateRankFromSpending,
} from "../utils/loyaltyUtils.js";
import {
  CheckoutStepper,
  ContactSection,
  ShippingSection,
  PaymentSection,
  ReviewSection,
  OrderSummary,
  OrderConfirmationScreen,
  SHIPPING_METHODS,
} from "../components/checkout";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function StripePaymentForm({ onSubmit, isSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    try {
      await onSubmit(stripe, elements, setError);
    } catch (submitError) {
      setError(submitError.message || "ไม่สามารถชำระเงินได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full rounded-lg bg-[#D0021B] py-3 font-bold text-white disabled:opacity-50"
      >
        {isSubmitting ? "กำลังดำเนินการ..." : "ชำระเงินและยืนยันคำสั่งซื้อ"}
      </button>
    </form>
  );
}

function StripeIntentSetup({ amount, onReady, onError }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    api
      .post("/payment/create-payment-intent", {
        amount: Math.round(amount * 100),
        currency: "thb",
      })
      .then((response) => {
        onReady(response.clientSecret || response.data?.clientSecret);
      })
      .catch((error) => {
        onError(error.data?.message || error.message || "เริ่มรายการชำระเงินไม่สำเร็จ");
      });
  }, [amount, onReady, onError]);

  return null;
}

function getAddressFormData(address) {
  const nameParts = (address.recipientName || "").trim().split(/\s+/);

  return {
    selectedAddressId: String(address._id || address.id),
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" "),
    phone: address.phone || "",
    address: address.addressDetail || address.addressLine || "",
    city: address.district || "",
    state: address.province || "",
    zipCode: address.zipCode || address.postalCode || "",
    saveAddress: false,
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const setAddressStore = useAddressStore((state) => state.setAddresses);
  let authUser = null;
  try {
    authUser = useAuth()?.user;
  } catch {
    authUser = authService.getCurrentUser();
  }
  const currentUser = authUser || authService.getCurrentUser();

  const [currentStep, setCurrentStep] = useState(2);
  const [email, setEmail] = useState(currentUser?.email || "");
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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentData, setPaymentData] = useState({ method: "credit-card" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [intentError, setIntentError] = useState("");

  useEffect(() => {
    async function loadSavedAddresses() {
      try {
        const response = await getAddresses();
        const addresses = response.data || [];
        setSavedAddresses(addresses);
        setAddressStore(addresses);

        const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
        if (defaultAddress) {
          setShippingData((previous) => ({
            ...previous,
            ...getAddressFormData(defaultAddress),
          }));
        }
      } catch (error) {
        console.warn("Could not load saved shipping addresses:", error.message);
      }
    }

    loadSavedAddresses();
  }, [setAddressStore]);

  const subtotal = getTotalPrice();
  const userRank = currentUser?.membership?.rank || "MEMBER";
  const discountPercent = RANK_DISCOUNT_PERCENT[userRank] || 0;
  const rankDiscountAmount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingMinimum = FREE_SHIPPING_MINIMUM[userRank] ?? 1000;
  const isFreeShipping = freeShippingMinimum === 0 || subtotal >= freeShippingMinimum;
  const selectedShipping = SHIPPING_METHODS.find(
    (method) => method.id === shippingData.shippingMethod,
  ) || SHIPPING_METHODS[0];
  const shippingCost = isFreeShipping ? 0 : selectedShipping.price;
  const discountedSubtotal = Math.max(0, subtotal - rankDiscountAmount);
  const taxAmount = currentStep >= 3 ? Math.round(discountedSubtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = discountedSubtotal + shippingCost + taxAmount;

  function buildOrderPayload() {
    return {
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
        state: shippingData.state || "",
        zipCode: shippingData.zipCode,
        location: shippingData.location || "Thailand",
        deliveryNote: shippingData.deliveryNote || "",
      },
      shippingMethod: shippingData.shippingMethod || "standard",
      paymentMethod: paymentData.method || "credit-card",
      shippingCost,
      couponCode: shippingData.couponCode || "",
    };
  }

  function getStockError() {
    const outOfStockItem = cartItems.find((item) => {
      const stock = Number(item.stockQuantity ?? item.stock_quantity);
      return Number.isFinite(stock) && (stock < 1 || item.quantity > stock);
    });

    if (!outOfStockItem) return "";

    const stock = Number(outOfStockItem.stockQuantity ?? outOfStockItem.stock_quantity);
    return stock < 1 ? "สินค้าหมดแล้ว" : "สินค้ามีไม่เพียงพอในสต็อก";
  }

  async function saveAddressIfRequested() {
    if (!shippingData.saveAddress) return;

    const response = await addAddress({
      recipientName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
      phone: shippingData.phone,
      addressDetail: shippingData.address,
      district: shippingData.city,
      province: shippingData.state,
      zipCode: shippingData.zipCode,
      isDefault: savedAddresses.length === 0,
    });

    const addresses = response.data || [];
    setSavedAddresses(addresses);
    setAddressStore(addresses);
  }

  async function finishOrder(payload) {
    const response = await createOrder(payload);
    const order = response?.data || response;
    let upgradedRank = null;

    if (currentUser) {
      const spending = Number(currentUser.membership?.accumulatedSpending || 0);
      const newRank = calculateRankFromSpending(spending + (order.subtotal ?? discountedSubtotal));
      if (newRank !== userRank) upgradedRank = newRank;
    }

    await saveAddressIfRequested();

    setCompletedOrder({
      orderId: order.orderNumber || order.orderId || order._id,
      shippingData: {
        ...(order.shippingAddress || shippingData),
        shippingMethod: order.shippingMethod || shippingData.shippingMethod,
      },
      email: order.customerEmail || payload.email,
      items: (order.items || cartItems).map((item) => ({
        ...item,
        name: item.title || item.name || item.productName,
        price: item.unitPrice || item.price,
      })),
      subtotal: order.subtotal ?? subtotal,
      rankDiscountAmount: order.discountAmount ?? rankDiscountAmount,
      userRank,
      upgradedRank,
      shippingCost: order.shippingCost ?? shippingCost,
      taxAmount: order.taxAmount ?? taxAmount,
      totalAmount: order.totalAmount ?? totalAmount,
    });

    clearCart();
    return order;
  }

  async function handlePlaceOrder(stripe, elements, showFormError = () => {}) {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const stockError = getStockError();
      if (stockError) throw new Error(stockError);

      const payload = buildOrderPayload();

      if (paymentData.method === "credit-card") {
        if (!stripe || !elements) {
          throw new Error("แบบฟอร์มบัตรยังโหลดไม่เสร็จ กรุณาลองใหม่");
        }
        if (!clientSecret) throw new Error("ไม่สามารถเริ่มรายการชำระเงินได้");

        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: { return_url: `${window.location.origin}/checkout` },
          redirect: "if_required",
        });

        if (result.error) throw new Error(result.error.message);
        if (result.paymentIntent?.status !== "succeeded") {
          throw new Error("การชำระเงินยังไม่สำเร็จ");
        }
        payload.paymentIntentId = result.paymentIntent.id;
      }

      const order = await finishOrder(payload);
      if (paymentData.method === "credit-card" && order?._id) {
        await api.post("/payment/bind-payment-intent", {
          paymentIntentId: payload.paymentIntentId,
          orderId: order._id,
        });
      }
    } catch (error) {
      console.error("Order payment failed:", error);
      const message =
        error.data?.message ||
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ";
      setSubmitError(message);
      showFormError(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectSavedAddress(addressId) {
    const address = savedAddresses.find(
      (item) => String(item._id || item.id) === String(addressId),
    );
    if (!address) return;

    setShippingData((previous) => ({
      ...previous,
      ...getAddressFormData(address),
    }));
  }

  function startNewAddress() {
    setShippingData((previous) => ({
      ...previous,
      selectedAddressId: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      saveAddress: true,
    }));
  }

  if (completedOrder) {
    return <OrderConfirmationScreen orderData={completedOrder} />;
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mb-8 text-gray-500">Please add items to your cart before checkout.</p>
        <Link to="/products" className="inline-block rounded-lg bg-black px-8 py-3 font-semibold text-white">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CheckoutStepper currentStep={currentStep} onStepClick={setCurrentStep} />

        {submitError && (
          <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{submitError}</span>
            <button onClick={() => setSubmitError("")} className="font-bold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {currentStep === 1 && (
              <ContactSection
                email={email}
                onChangeEmail={setEmail}
                onContinue={() => setCurrentStep(2)}
                onBack={() => navigate("/cart")}
              />
            )}

            {currentStep === 2 && (
              <>
                <ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} />
                <ShippingSection
                  shippingData={shippingData}
                  savedAddresses={savedAddresses}
                  onSelectAddress={selectSavedAddress}
                  onAddNewAddress={startNewAddress}
                  onChangeShipping={setShippingData}
                  onContinue={() => setCurrentStep(3)}
                  onBack={() => navigate("/cart")}
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} />
                <ShippingSection shippingData={shippingData} isCollapsed onEdit={() => setCurrentStep(2)} />
                <PaymentSection
                  paymentData={paymentData}
                  onChangePayment={setPaymentData}
                  onContinue={() => {
                    setSubmitError("");
                    setCurrentStep(4);
                  }}
                  onBack={() => setCurrentStep(2)}
                />
              </>
            )}

            {currentStep === 4 && (
              <>
                <ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} />
                <ShippingSection shippingData={shippingData} isCollapsed onEdit={() => setCurrentStep(2)} />
                <PaymentSection paymentData={paymentData} isCollapsed onEdit={() => setCurrentStep(3)} />

                {paymentData.method === "credit-card" ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h2 className="mb-4 text-xl font-bold">ชำระเงินด้วยบัตร</h2>
                    {!clientSecret ? (
                      <>
                        <Elements stripe={stripePromise}>
                          <StripeIntentSetup
                            amount={totalAmount}
                            onReady={setClientSecret}
                            onError={setIntentError}
                          />
                        </Elements>
                        <p className="text-sm text-gray-600">
                          {intentError || "กำลังเตรียมแบบฟอร์มชำระเงิน..."}
                        </p>
                      </>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm onSubmit={handlePlaceOrder} isSubmitting={isSubmitting} />
                      </Elements>
                    )}
                  </div>
                ) : (
                  <ReviewSection
                    email={email}
                    shippingData={shippingData}
                    paymentData={paymentData}
                    onEditStep={setCurrentStep}
                    onBack={() => setCurrentStep(3)}
                    onPlaceOrder={() => handlePlaceOrder(null, null)}
                    isSubmitting={isSubmitting}
                  />
                )}
              </>
            )}
          </div>

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
