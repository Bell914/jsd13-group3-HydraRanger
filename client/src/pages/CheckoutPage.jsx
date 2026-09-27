import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../store/cartStore";
import { useAddressStore } from "../store/addressStore.js";
import { authService } from "../services/authService";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { getAddresses, addAddress } from "../services/userService.js";
import { createOrder, confirmPayment, cancelOrder } from "../services/orderService.js";
import { normalizeProvince } from "../constants/provinces.js";
import {
  RANK_DISCOUNT_PERCENT,
  FREE_SHIPPING_MINIMUM,
  calculateRankFromSpending,
} from "../utils/loyaltyUtils.js";
import { couponService } from "../services/couponService.js";
import {
  CheckoutStepper,
  ContactSection,
  ShippingSection,
  PaymentSection,
  PromptPayQrPanel,
  DemoCardForm,
  OrderSummary,
  OrderConfirmationScreen,
  SHIPPING_METHODS,
} from "../components/checkout";

function getAddressFormData(address) {
  const nameParts = (address.recipientName || "").trim().split(/\s+/).filter(Boolean);

  return {
    selectedAddressId: String(address._id || address.id),
    firstName: address.firstName?.trim() || nameParts[0] || "",
    lastName: address.lastName?.trim() || nameParts.slice(1).join(" "),
    phone: address.phone || "",
    address: address.addressDetail || address.addressLine || "",
    city: address.district || "",
    state: normalizeProvince(address.province || address.state),
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
  const [paymentData, setPaymentData] = useState({ method: "promptpay" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitError, setSubmitError] = useState("");
  // Set once the order exists on the server so a failed confirmation can be retried
  // against the same order instead of reserving stock a second time.
  const [pendingOrderId, setPendingOrderId] = useState("");
  // True while the pending order is being released, so the customer cannot start a new
  // order that would reserve the same stock before the cancel lands.
  const [isCancelling, setIsCancelling] = useState(false);
  const pendingOrderIdRef = useRef("");
  const cancelRequestRef = useRef(null);
  const orderSubmissionInProgress = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // The confirmation screen is much shorter than the payment form, so the browser
  // keeps the old offset and lands the customer mid-page. Jump to the top of step 4.
  useLayoutEffect(() => {
    if (!completedOrder) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [completedOrder]);

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
            selectedAddressId: String(defaultAddress._id || defaultAddress.id),
          }));
        }
      } catch (error) {
        console.warn("Could not load saved shipping addresses:", error.message);
      }
    }

    loadSavedAddresses();
  }, [setAddressStore]);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = getTotalPrice();
  const userRank = currentUser?.membership?.rank || "MEMBER";
  const discountPercent = RANK_DISCOUNT_PERCENT[userRank] || 0;
  const rankDiscountAmount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingMinimum = FREE_SHIPPING_MINIMUM[userRank] ?? 1000;
  const isFreeShipping = freeShippingMinimum === 0 || subtotal >= freeShippingMinimum;
  const selectedShipping =
    SHIPPING_METHODS.find((method) => method.id === shippingData.shippingMethod) ||
    SHIPPING_METHODS[0];
  const shippingCost = isFreeShipping ? 0 : selectedShipping.price;

  const couponDiscountAmount = appliedCoupon
    ? (appliedCoupon.discountAmount || Math.round((subtotal * (appliedCoupon.discountValue || 5)) / 100))
    : 0;
  const totalDiscount = Math.max(rankDiscountAmount, couponDiscountAmount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const totalAmount = discountedSubtotal + shippingCost;

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

  function buildOrderPayload() {
    return {
      email: email || currentUser?.email,
      items: cartItems.map((item) => ({
        productId: item.productId || item._id || item.product_id,
        variantId: item.variantId || item.variant_id,
        sku: item.sku || "",
        quantity: item.quantity,
        price: item.price,
        lookbookId: item.lookbookId || "",
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
      paymentMethod: paymentData.method || "promptpay",
      shippingCost,
      couponCode: appliedCoupon?.code || shippingData.couponCode || "",
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

  // The pending id lives in a ref as well as state so async flows always read the current
  // value instead of the one captured when their handler was created.
  function trackPendingOrder(orderId) {
    pendingOrderIdRef.current = orderId;
    setPendingOrderId(orderId);
  }

  async function cancelPendingOrder(orderId) {
    setIsCancelling(true);
    setSubmitError("");

    try {
      await cancelOrder(orderId);
      trackPendingOrder("");
    } catch (error) {
      // The order still holds stock, so keep the id: a retry then confirms this order
      // instead of creating a second one, and the customer can cancel it again.
      console.warn("Could not cancel the pending order:", error.message);
      setSubmitError("ยกเลิกออเดอร์ไม่สำเร็จ กรุณากดยกเลิกออเดอร์อีกครั้ง");
    } finally {
      setIsCancelling(false);
    }
  }

  // Releases the order we created but could not confirm so its stock and coupon go back
  // before the customer changes anything about the order. The id is only dropped once the
  // server confirms the cancel, so no new order can be created while the old one still
  // holds stock. Returns a promise only when a cancel is needed, which keeps callers that
  // have nothing to wait for synchronous, and shares one request with concurrent callers.
  function abandonPendingOrder() {
    if (cancelRequestRef.current) return cancelRequestRef.current;
    if (!pendingOrderIdRef.current) return null;

    const request = cancelPendingOrder(pendingOrderIdRef.current).finally(() => {
      if (cancelRequestRef.current === request) cancelRequestRef.current = null;
    });
    cancelRequestRef.current = request;
    return request;
  }

  function goToStep(step) {
    // Walking away from the payment step abandons any order created but not confirmed.
    const cancelRequest = step < 3 ? abandonPendingOrder() : null;
    if (cancelRequest) {
      cancelRequest.then(() => setCurrentStep(step));
      return;
    }

    setCurrentStep(step);
  }

  function handlePaymentMethodChange(nextPayment) {
    // The old order must release its stock before the channel changes, otherwise the next
    // attempt could create a second order while the previous one is still reserved.
    const cancelRequest = abandonPendingOrder();
    if (cancelRequest) {
      setSubmitError("");
      cancelRequest.then(() => setPaymentData(nextPayment));
      return;
    }

    setSubmitError("");
    setPaymentData(nextPayment);
  }

  async function finishOrder(payload, order) {
    let upgradedRank = null;

    if (currentUser) {
      const spending = Number(currentUser.membership?.accumulatedSpending || 0);
      const newRank = calculateRankFromSpending(spending + (order.subtotal ?? discountedSubtotal));
      if (newRank !== userRank) upgradedRank = newRank;
    }

    try {
      await saveAddressIfRequested();
    } catch (error) {
      // Address saving is optional and must not hide a successful payment.
      console.warn("Could not save shipping address:", error.message);
    }

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
      rankDiscountAmount: order.discountAmount ?? totalDiscount,
      userRank,
      upgradedRank,
      shippingCost: order.shippingCost ?? shippingCost,
      totalAmount: order.totalAmount ?? totalAmount,
      paymentMethod: order.paymentMethod || payload.paymentMethod,
    });
    setCurrentStep(4);
    clearCart();
    return order;
  }

  // Creates the order, then reports the settled demo payment so the server moves the
  // order to `paid` through the normal status machine. Once the order exists, a retry
  // must confirm that same order instead of reserving stock a second time.
  async function handlePlaceOrder() {
    if (orderSubmissionInProgress.current) return;
    orderSubmissionInProgress.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // A cancel that is still running must land first, otherwise this attempt would
      // create a second order while the abandoned one still holds stock.
      if (cancelRequestRef.current) await cancelRequestRef.current;

      const payload = buildOrderPayload();
      let orderId = pendingOrderIdRef.current;
      let order = null;

      if (!orderId) {
        const stockError = getStockError();
        if (stockError) throw new Error(stockError);

        const createResponse = await createOrder(payload);
        order = createResponse?.data || createResponse;
        orderId = order?._id;
        if (!orderId) {
          throw new Error("สร้างคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        }
        trackPendingOrder(orderId);
      }

      const confirmResponse = await confirmPayment(orderId);
      const paidOrder = confirmResponse?.data || confirmResponse || order;
      trackPendingOrder("");

      await finishOrder(payload, paidOrder);
    } catch (error) {
      console.error("Order payment failed:", error);

      // 400/404 mean this order can never be confirmed, so drop it and start fresh.
      if ([400, 404].includes(error.status)) {
        trackPendingOrder("");
      }

      setCurrentStep(3);
      setSubmitError(
        error.data?.message ||
          error.response?.data?.message ||
          error.message ||
          "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ",
      );
    } finally {
      orderSubmissionInProgress.current = false;
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
      selectedAddressId: String(address._id || address.id),
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
      saveAddress: true,
    }));
  }

  if (completedOrder) {
    return <OrderConfirmationScreen orderData={completedOrder} />;
  }

  if (!cartItems.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">ตะกร้าสินค้าว่างเปล่า</h1>
        <p className="mb-8 text-gray-500">กรุณาเพิ่มสินค้าลงในตะกร้าก่อนดำเนินการชำระเงิน</p>
        <Link to="/products" className="inline-block rounded-lg bg-black px-8 py-3 font-semibold text-white">
          เลือกดูสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <CheckoutStepper currentStep={currentStep} onStepClick={goToStep} />

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
                <ContactSection email={email} isCollapsed onEdit={() => goToStep(1)} />
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
                <ContactSection email={email} isCollapsed onEdit={() => goToStep(1)} />
                <ShippingSection shippingData={shippingData} isCollapsed onEdit={() => goToStep(2)} />
                <PaymentSection
                  paymentData={paymentData}
                  onChangePayment={handlePaymentMethodChange}
                  isCancelling={isCancelling}
                  onBack={() => goToStep(2)}
                />
                {paymentData.method === "credit-card" ? (
                  <DemoCardForm
                    isSubmitting={isSubmitting}
                    isCancelling={isCancelling}
                    error={submitError}
                    onSubmit={handlePlaceOrder}
                  />
                ) : (
                  <PromptPayQrPanel
                    totalAmount={totalAmount}
                    isSubmitting={isSubmitting}
                    isCancelling={isCancelling}
                    error={submitError}
                    onConfirm={handlePlaceOrder}
                  />
                )}
                {pendingOrderId && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-xs">
                    <p>
                      ออเดอร์ของคุณถูกสร้างไว้แล้ว กดปุ่มชำระเงินอีกครั้งเพื่อยืนยันออเดอร์เดิม
                      โดยไม่ต้องสร้างออเดอร์ซ้ำ
                    </p>
                    <button
                      type="button"
                      onClick={abandonPendingOrder}
                      disabled={isSubmitting || isCancelling}
                      className="mt-3 w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
                    >
                      {isCancelling ? "กำลังยกเลิกออเดอร์..." : "ยกเลิกออเดอร์นี้และเริ่มใหม่"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shippingMethodId={shippingData.shippingMethod}
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
