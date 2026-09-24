import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import { useCartStore } from "../store/cartStore";
import { createOrder } from "../services/orderService";

vi.stubEnv("VITE_STRIPE_PUBLISHABLE_KEY", "pk_test_checkout");

const stripeMocks = vi.hoisted(() => ({
  confirmPayment: vi.fn().mockResolvedValue({ paymentIntent: { id: "pi_test", status: "succeeded" } }),
  elements: {},
}));

vi.mock("../services/orderService", () => ({ createOrder: vi.fn() }));
vi.mock("../services/userService", () => ({ getAddresses: vi.fn().mockResolvedValue({ data: [] }) }));
vi.mock("../services/api.js", () => ({ api: { post: vi.fn().mockResolvedValue({ clientSecret: "pi_secret_test" }) } }));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(() => Promise.resolve({})) }));
vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element" />,
  useElements: () => stripeMocks.elements,
  useStripe: () => ({ confirmPayment: stripeMocks.confirmPayment }),
}));

const fillShippingForm = () => {
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Test" } });
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "User" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "0812345678" } });
  fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Street" } });
  fireEvent.change(screen.getByLabelText("City"), { target: { value: "Bangkok" } });
  fireEvent.change(screen.getByLabelText("State"), { target: { value: "Bangkok" } });
  fireEvent.change(screen.getByLabelText("Zip code"), { target: { value: "10110" } });
};

const goToCheckoutPaymentStep = () => {
  fillShippingForm();
  fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
  fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
};

describe("Checkout order integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stripeMocks.confirmPayment.mockResolvedValue({ paymentIntent: { id: "pi_test", status: "succeeded" } });
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

  it("creates the order after successful payment, shows confirmation, then clears cart", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");
    fireEvent.click(screen.getByRole("button", { name: /ชำระเงินและยืนยันคำสั่งซื้อ/i }));

    expect(await screen.findByText(/Your OCCASION order is confirmed!/i)).toBeInTheDocument();
    expect(stripeMocks.confirmPayment).toHaveBeenCalled();
    expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({ paymentIntentId: "pi_test" }));
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("shows API failure in the red alert and preserves cart", async () => {
    createOrder.mockRejectedValueOnce(Object.assign(new Error("request failed"), { data: { message: "สินค้ามีไม่เพียงพอในสต็อก" } }));
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToCheckoutPaymentStep();
    await screen.findByTestId("payment-element");
    fireEvent.click(screen.getByRole("button", { name: /ชำระเงินและยืนยันคำสั่งซื้อ/i }));

    await waitFor(() => expect(screen.getAllByRole("alert").some((alert) => alert.textContent.includes("สินค้ามีไม่เพียงพอในสต็อก"))).toBe(true));
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
});
