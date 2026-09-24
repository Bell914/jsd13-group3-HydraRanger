import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import { useCartStore } from "../store/cartStore";
import { createOrder } from "../services/orderService.js";
import { getAddresses } from "../services/userService.js";

vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "pk_test_checkout");

const stripeMocks = vi.hoisted(() => ({
  confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { id: "pi_test", status: "succeeded" } }),
  elements: {},
}));
const apiMocks = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({ clientSecret: "pi_secret_test" }),
  patch: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../services/orderService.js", () => ({ createOrder: vi.fn() }));
vi.mock("../services/userService.js", () => ({ getAddresses: vi.fn().mockResolvedValue({ data: [] }) }));
vi.mock("../services/api.js", () => ({ api: apiMocks }));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(() => Promise.resolve({})) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useElements: () => stripeMocks.elements,
  useStripe: () => ({ confirmPayment: stripeMocks.confirmPayment }),
}));

const fillShippingForm = () => {
  fireEvent.change(screen.getByLabelText("ชื่อ"), { target: { value: "Test" } });
  fireEvent.change(screen.getByLabelText("นามสกุล"), { target: { value: "User" } });
  fireEvent.change(screen.getByLabelText("เบอร์โทรศัพท์"), { target: { value: "0812345678" } });
  fireEvent.change(screen.getByLabelText("บ้านเลขที่ / ถนน / อาคาร"), { target: { value: "123 Street" } });
  fireEvent.change(screen.getByLabelText("อำเภอ / เขต"), { target: { value: "Bangkok" } });
  fireEvent.change(screen.getByLabelText("จังหวัด"), { target: { value: "Bangkok" } });
  fireEvent.change(screen.getByLabelText("รหัสไปรษณีย์"), { target: { value: "10110" } });
};

const goToCheckoutPaymentStep = () => {
  fillShippingForm();
  fireEvent.click(screen.getAllByRole("button", { name: "ดำเนินการต่อ" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "ดำเนินการต่อ" }));
};

describe("Checkout order integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stripeMocks.confirmPayment.mockResolvedValue({ paymentIntent: { id: "pi_test", status: "succeeded" } });
    apiMocks.post.mockResolvedValue({ clientSecret: "pi_secret_test" });
    createOrder.mockResolvedValue({
      data: {
        _id: "order-mongo-id",
        orderNumber: "OCC-123456",
        customerEmail: "test@example.com",
        shippingAddress: { firstName: "Test", lastName: "User", address: "123 Street" },
        items: [{ title: "Oversized T-Shirt", unitPrice: 590, quantity: 2 }],
        totalAmount: 1231.4,
        status: "pending",
      },
    });
    useCartStore.setState({ cartItems: [{ productId: "p1", variantId: "v1", name: "Oversized T-Shirt", price: 590, quantity: 2, stockQuantity: 5 }] });
  });

  it("creates the order before payment, confirms it, then shows confirmation and clears cart", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");
    fireEvent.click(screen.getByRole("button", { name: /ชำระเงินและยืนยันคำสั่งซื้อ/i }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(stripeMocks.confirmPayment).toHaveBeenCalled();
    expect(apiMocks.post).toHaveBeenCalledWith("/payment/create-payment-intent", {
      orderId: "order-mongo-id",
    });
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder.mock.invocationCallOrder[0]).toBeLessThan(
      apiMocks.post.mock.invocationCallOrder[0],
    );
    expect(apiMocks.post.mock.invocationCallOrder[0]).toBeLessThan(
      stripeMocks.confirmPayment.mock.invocationCallOrder[0],
    );
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("shows API failure in the red alert and preserves cart", async () => {
    createOrder.mockRejectedValueOnce(Object.assign(new Error("request failed"), { data: { message: "สินค้ามีไม่เพียงพอในสต็อก" } }));
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();

    await waitFor(() => expect(screen.getAllByRole("alert").some((alert) => alert.textContent.includes("สินค้ามีไม่เพียงพอในสต็อก"))).toBe(true));
    expect(apiMocks.post).not.toHaveBeenCalled();
    expect(stripeMocks.confirmPayment).not.toHaveBeenCalled();
    expect(useCartStore.getState().cartItems).toHaveLength(1);
  });

  it("cancels the prepared order when leaving checkout step 4", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");

    fireEvent.click(screen.getAllByRole("button", { name: "แก้ไข" })[2]);

    await waitFor(() => {
      expect(apiMocks.post).toHaveBeenCalledWith("/payment/cancel-payment-intent", {
        orderId: "order-mongo-id",
      });
    });
    expect(screen.getByRole("heading", { name: "ช่องทางการชำระเงิน" })).toBeInTheDocument();
  });

  it("cancels an order after payment fails so reserved stock can be released", async () => {
    stripeMocks.confirmPayment.mockResolvedValueOnce({
      error: { type: "card_error", message: "บัตรถูกปฏิเสธ" },
    });
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");
    fireEvent.click(screen.getByRole("button", { name: /ชำระเงินและยืนยันคำสั่งซื้อ/i }));

    expect(await screen.findByText("ลองชำระเงินอีกครั้ง")).toBeInTheDocument();
    expect(apiMocks.post).toHaveBeenCalledWith("/payment/cancel-payment-intent", {
      orderId: "order-mongo-id",
    });
    expect(useCartStore.getState().cartItems).toHaveLength(1);
  });

  it("does not allow increasing cart quantity beyond known stock", () => {
    const { updateQuantity } = useCartStore.getState();
    updateQuantity("v1", 99);
    expect(useCartStore.getState().cartItems[0].quantity).toBe(5);
  });

  it("does not add an item when its stock is zero", () => {
    useCartStore.setState({ cartItems: [] });
    useCartStore.getState().addToCart({
      product: { _id: "p2", name: "Out of stock" },
      variant: { _id: "v2", stockQuantity: 0, price: 10 },
      quantity: 1,
    });

    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("requires a last name when a saved address only has a one-word recipient name", async () => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-one-word-name",
        recipientName: "สมชาย",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "บางรัก",
        province: "กรุงเทพมหานคร",
        zipCode: "10500",
        isDefault: true,
      }],
    });

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText("นามสกุล")).toHaveValue(""));
    fireEvent.click(screen.getByRole("button", { name: "ดำเนินการต่อ" }));

    expect(await screen.findByText("กรุณากรอกนามสกุล")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "ช่องทางการชำระเงิน" })).not.toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("only offers Stripe card payments in checkout", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");

    expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
    expect(screen.queryByText("PromptPay")).not.toBeInTheDocument();
    expect(screen.queryByText("PayPal")).not.toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);
  });
});
