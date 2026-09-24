import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import { useAddressStore } from "../store/addressStore.js";
import { authService } from "../services/authService";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { RANK_DISCOUNT_PERCENT, FREE_SHIPPING_MINIMUM, calculateRankFromSpending } from "../utils/loyaltyUtils.js";
import { getAddresses } from "../services/userService";
import { createOrder } from "../services/orderService.js";
import { api } from "../services/api.js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRef } from "react";
import { CheckoutStepper, ContactSection, ShippingSection, PaymentSection, ReviewSection, OrderSummary, OrderConfirmationScreen, SHIPPING_METHODS } from "../components/checkout";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : null;

function StripePaymentForm({ onSubmit, isSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  return <form onSubmit={async (event) => { event.preventDefault(); setError(""); if (!stripe || !elements) return; try { await onSubmit(stripe, elements, setError); } catch (err) { setError(err.message || "ไม่สามารถชำระเงินได้ กรุณาลองใหม่อีกครั้ง"); } }} className="space-y-4">
    <PaymentElement />
    {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    <button disabled={!stripe || isSubmitting} className="w-full rounded-lg bg-[#D0021B] py-3 font-bold text-white disabled:opacity-50">{isSubmitting ? "กำลังดำเนินการ..." : "ชำระเงินและยืนยันคำสั่งซื้อ"}</button>
  </form>;
}

function StripeIntentSetup({ amount, onReady, onError }) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api.post("/payment/create-payment-intent", { amount: Math.round(amount * 100), currency: "thb" })
      .then((response) => onReady(response.clientSecret || response.data?.clientSecret))
      .catch((error) => onError(error.data?.message || error.message || "ไม่สามารถเริ่มรายการชำระเงินได้"));
  }, [amount, onReady, onError]);
  return null;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const addAddress = useAddressStore((state) => state.addAddress);
  let authUser = null;
  try { authUser = useAuth()?.user; } catch { authUser = authService.getCurrentUser(); }
  const currentUser = authUser || authService.getCurrentUser();
  const [currentStep, setCurrentStep] = useState(2);
  const [email, setEmail] = useState(currentUser?.email || "");
  const [shippingData, setShippingData] = useState({ location: "Thailand", firstName: "", lastName: "", phone: "", address: "", deliveryNote: "", city: "", state: "", zipCode: "", saveAddress: false, shippingMethod: "standard", isGift: false, giftMessage: "" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentData, setPaymentData] = useState({ method: "credit-card" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [intentError, setIntentError] = useState("");

  useEffect(() => {
    getAddresses().then((res) => {
      const addresses = res.data || (Array.isArray(res) ? res : []);
      setSavedAddresses(addresses);
      const selected = addresses.find((item) => item.isDefault) || addresses[0];
      if (selected) {
        const names = (selected.recipientName || "").trim().split(" ");
        setShippingData((prev) => ({ ...prev, firstName: names[0] || prev.firstName, lastName: names.slice(1).join(" ") || prev.lastName, phone: selected.phone || prev.phone, address: selected.addressLine || prev.address, city: selected.district || prev.city, state: selected.province || prev.state, zipCode: selected.postalCode || prev.zipCode }));
      }
    }).catch((err) => console.warn("Could not load saved shipping addresses:", err.message));
  }, []);

  const subtotal = getTotalPrice();
  const userRank = currentUser?.membership?.rank || "MEMBER";
  const discountPercent = RANK_DISCOUNT_PERCENT[userRank] || 0;
  const rankDiscountAmount = discountPercent ? Math.round(subtotal * discountPercent / 100) : 0;
  const isFreeShipping = FREE_SHIPPING_MINIMUM[userRank] === 0 || subtotal >= (FREE_SHIPPING_MINIMUM[userRank] ?? 1000);
  const selectedShipping = SHIPPING_METHODS.find((method) => method.id === shippingData.shippingMethod) || SHIPPING_METHODS[0];
  const shippingCost = isFreeShipping ? 0 : selectedShipping.price;
  const discountedSubtotal = Math.max(0, subtotal - rankDiscountAmount);
  const taxAmount = currentStep >= 3 ? Math.round(discountedSubtotal * 0.06 * 100) / 100 : 0;
  const totalAmount = discountedSubtotal + shippingCost + taxAmount;

  const buildOrderPayload = () => ({
    email: email || currentUser?.email,
    items: cartItems.map((item) => ({ productId: item.productId || item._id || item.product_id, variantId: item.variantId || item.variant_id, sku: item.sku || "", quantity: item.quantity, price: item.price })),
    shippingAddress: { firstName: shippingData.firstName, lastName: shippingData.lastName, phone: shippingData.phone, address: shippingData.address, city: shippingData.city, state: shippingData.state || "", zipCode: shippingData.zipCode, location: shippingData.location || "Thailand", deliveryNote: shippingData.deliveryNote || "" },
    shippingMethod: shippingData.shippingMethod || "standard", paymentMethod: paymentData.method || "credit-card", shippingCost, couponCode: shippingData.couponCode || ""
  });

  const finishOrder = async (payload) => {
    const response = await createOrder(payload);
    const created = response?.data || response;
    let upgradedRank = null;
    if (currentUser) {
      const nextRank = calculateRankFromSpending(Number(currentUser.membership?.accumulatedSpending || 0) + (created?.subtotal ?? discountedSubtotal));
      if (nextRank !== userRank) upgradedRank = nextRank;
    }
    if (shippingData.saveAddress) addAddress({ ...shippingData, location: shippingData.location || "Thailand" });
    setCompletedOrder({ orderId: created.orderNumber || created.orderId || created._id, shippingData: { ...(created.shippingAddress || shippingData), shippingMethod: created.shippingMethod || shippingData.shippingMethod }, email: created.customerEmail || payload.email, items: (created.items || cartItems).map((item) => ({ ...item, name: item.title || item.name || item.productName, price: item.unitPrice || item.price })), subtotal: created.subtotal ?? subtotal, rankDiscountAmount: created.discountAmount ?? rankDiscountAmount, userRank, upgradedRank, shippingCost: created.shippingCost ?? shippingCost, taxAmount: created.taxAmount ?? taxAmount, totalAmount: created.totalAmount ?? totalAmount });
    clearCart();
    return created;
    return created;
  };

  const handlePlaceOrder = async (stripe, elements, setFormError = () => {}) => {
    setIsSubmitting(true); setSubmitError("");
    try {
      const payload = buildOrderPayload();
      const invalidStockItem = cartItems.find((item) => {
        const stock = Number(item.stockQuantity ?? item.stock_quantity);
        return Number.isFinite(stock) && (stock < 1 || Number(item.quantity) > stock);
      });
      if (invalidStockItem) throw new Error(Number(invalidStockItem.stockQuantity ?? invalidStockItem.stock_quantity) < 1 ? "สินค้าหมดแล้ว" : "สินค้ามีไม่เพียงพอในสต็อก");
      if (paymentData.method === "credit-card") {
        if (!stripe || !elements) throw new Error("แบบฟอร์มบัตรยังโหลดไม่เสร็จ กรุณารอสักครู่แล้วลองใหม่");
        const secret = clientSecret;
        if (!secret) throw new Error("ไม่สามารถเริ่มรายการชำระเงินได้");
        const result = await stripe.confirmPayment({ elements, clientSecret: secret, confirmParams: { return_url: `${window.location.origin}/checkout` }, redirect: "if_required" });
        if (result.error) throw new Error(result.error.message);
        if (result.paymentIntent?.status !== "succeeded") throw new Error("การชำระเงินยังไม่สำเร็จ");
        payload.paymentIntentId = result.paymentIntent.id;
      }
      const createdOrder = await finishOrder(payload);
      if (paymentData.method === "credit-card" && createdOrder?._id) {
        await api.post("/payment/bind-payment-intent", { paymentIntentId: payload.paymentIntentId, orderId: createdOrder._id });
      }
    } catch (err) {
      console.error("Order payment failed:", err);
      const message = err.data?.message || err.response?.data?.message || err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setSubmitError(message); setFormError(message); throw err;
    } finally { setIsSubmitting(false); }
  };

  if (completedOrder) return <OrderConfirmationScreen orderData={completedOrder} />;
  if (!cartItems?.length) return <div className="mx-auto max-w-4xl px-4 py-16 text-center"><h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1><p className="mb-8 text-gray-500">Please add items to your cart before proceeding to checkout.</p><Link to="/products" className="inline-block rounded-lg bg-black px-8 py-3 font-semibold text-white">Explore Products</Link></div>;

  return <div className="min-h-screen bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><CheckoutStepper currentStep={currentStep} onStepClick={setCurrentStep} />
    {submitError && <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{submitError}</span><button onClick={() => setSubmitError("")} className="font-bold">✕</button></div>}
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2">
      {currentStep === 1 && <ContactSection email={email} onChangeEmail={setEmail} isCollapsed={false} onContinue={() => setCurrentStep(2)} onBack={() => navigate("/cart")} />}
      {currentStep === 2 && <><ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} /><ShippingSection shippingData={shippingData} savedAddresses={savedAddresses} onChangeShipping={setShippingData} isCollapsed={false} onContinue={() => setCurrentStep(3)} onBack={() => navigate("/cart")} /></>}
      {currentStep === 3 && <><ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} /><ShippingSection shippingData={shippingData} isCollapsed onEdit={() => setCurrentStep(2)} /><PaymentSection paymentData={paymentData} onChangePayment={setPaymentData} isCollapsed={false} onContinue={() => { setSubmitError(""); setCurrentStep(4); }} onBack={() => setCurrentStep(2)} /></>}
      {currentStep === 4 && <><ContactSection email={email} isCollapsed onEdit={() => setCurrentStep(1)} /><ShippingSection shippingData={shippingData} isCollapsed onEdit={() => setCurrentStep(2)} /><PaymentSection paymentData={paymentData} isCollapsed onEdit={() => setCurrentStep(3)} />{paymentData.method === "credit-card" ? <div className="rounded-lg border border-gray-200 bg-white p-6"><h2 className="mb-4 text-xl font-bold">ชำระเงินด้วยบัตร</h2>{!clientSecret ? <><Elements stripe={stripePromise}><StripeIntentSetup amount={totalAmount} onReady={setClientSecret} onError={setIntentError} /></Elements><p className="text-sm text-gray-600">{intentError || "กำลังเตรียมแบบฟอร์มชำระเงิน..."}</p></> : <Elements stripe={stripePromise} options={{ clientSecret }}><StripePaymentForm onSubmit={handlePlaceOrder} isSubmitting={isSubmitting} /></Elements>}</div> : <ReviewSection email={email} shippingData={shippingData} paymentData={paymentData} onEditStep={setCurrentStep} onBack={() => setCurrentStep(3)} onPlaceOrder={() => handlePlaceOrder(null, null)} isSubmitting={isSubmitting} />}</>}
    </div><div className="lg:col-span-1"><OrderSummary cartItems={cartItems} subtotal={subtotal} shippingMethodId={shippingData.shippingMethod} currentStep={currentStep} userRank={userRank} rankDiscountAmount={rankDiscountAmount} /></div></div>
  </div></div>;
}
