import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach, vi } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import CartPage from "../pages/CartPage";
import { useCartStore } from "../store/cartStore";
import { createOrder } from "../services/orderService";

// ➕ Mock orderService เพื่อไม่ให้ยิงไปที่ Backend จริงตอนทำ Automated Test
vi.mock("../services/orderService", () => ({
  createOrder: vi.fn().mockResolvedValue({
    orderNumber: "OCC-123456",
    customerEmail: "test@example.com",
    shippingAddress: {
      firstName: "Test",
      lastName: "User",
      address: "123 Street",
    },
    items: [
      { title: "Oversized T-Shirt", unitPrice: 590, quantity: 2 }
    ],
    totalAmount: 1231.4,
  }),
}));

const fillShippingForm = () => {
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "Test" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "User" },
  });
  fireEvent.change(screen.getByLabelText("Phone number"), {
    target: { value: "0812345678" },
  });
  fireEvent.change(screen.getByLabelText("Address"), {
    target: { value: "123 Street" },
  });
  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Bangkok" },
  });
  fireEvent.change(screen.getByLabelText("State"), {
    target: { value: "Bangkok" },
  });
  fireEvent.change(screen.getByLabelText("Zip code"), {
    target: { value: "10110" },
  });
};

const fillCardForm = () => {
  fireEvent.change(screen.getByPlaceholderText("4541 1234 5678 9012"), {
    target: { value: "4111111111111111" },
  });
  fireEvent.change(screen.getByPlaceholderText("ดด/ปป (เช่น 12/28)"), {
    target: { value: "12/28" },
  });
  fireEvent.change(screen.getByPlaceholderText("รหัส 3 หลักหลังบัตร"), {
    target: { value: "123" },
  });
};

describe("Cart & Checkout Flow", () => {
  beforeEach(() => {
    useCartStore.setState({
      cartItems: [
        {
          productId: "p1",
          variantId: "v1",
          name: "Oversized T-Shirt",
          color: "Off White",
          size: "M",
          price: 590,
          quantity: 2,
        },
      ],
    });
  });

  describe("CartPage", () => {
    it("renders modern clothing cart with item details and Proceed to Checkout button", () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );

<<<<<<< HEAD
      expect(screen.getByText(/ตะกร้าสินค้าของคุณ/)).toBeInTheDocument();
      expect(screen.getByText("Oversized T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("สี: Off White")).toBeInTheDocument();
      expect(screen.getByText("ไซส์: M")).toBeInTheDocument();
      expect(screen.getAllByText("฿1,180").length).toBeGreaterThanOrEqual(1);
=======
      expect(
        screen.getByRole("heading", { name: /shopping cart/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Oversized T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Off White")).toBeInTheDocument();
      expect(screen.getByText("Size M")).toBeInTheDocument();
      expect(screen.getByText(/฿1180/)).toBeInTheDocument();
>>>>>>> develop

      const checkoutBtn = screen.getByRole("link", {
        name: /ดำเนินการชำระเงิน/i,
      });
      expect(checkoutBtn).toBeInTheDocument();
      expect(checkoutBtn).toHaveAttribute("href", "/checkout");
    });

    it("allows adjusting quantity and deleting items", () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );

      const increaseBtn = screen.getByRole("button", {
        name: "Increase quantity",
      });
      fireEvent.click(increaseBtn);
      expect(useCartStore.getState().cartItems[0].quantity).toBe(3);

      const deleteBtn = screen.getByTitle("Remove item");
      fireEvent.click(deleteBtn);
      expect(useCartStore.getState().cartItems.length).toBe(0);
    });
  });

  describe("CheckoutPage", () => {
    it("renders Stepper with 4 steps and starts on Step 2 Shipping", () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      expect(screen.getAllByText("Contact").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Shipping").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();

      expect(screen.getByLabelText("First name")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "CONTINUE" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "ย้อนกลับ" })
      ).toBeInTheDocument();
    });

    it("navigates to Step 3 Payment and has Back button that returns to Step 2", () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      fillShippingForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

<<<<<<< HEAD
      expect(screen.getByText(/ใช้งาน Gift Card/)).toBeInTheDocument();
=======
      expect(screen.getByText(/Use my Gift Card/i)).toBeInTheDocument();
>>>>>>> develop

      const backBtn = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backBtn).toBeInTheDocument();

      fireEvent.click(backBtn);
      expect(screen.getByLabelText("First name")).toBeInTheDocument();
    });

    it("navigates to Step 4 Review and has Back button that returns to Step 3", () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      fillShippingForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
      fillCardForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      expect(
        screen.getByRole("button", { name: "PLACE ORDER" })
      ).toBeInTheDocument();

      const backBtn = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backBtn).toBeInTheDocument();

      fireEvent.click(backBtn);
<<<<<<< HEAD
      expect(screen.getByText(/ใช้งาน Gift Card/)).toBeInTheDocument();
=======
      expect(screen.getByText(/Use my Gift Card/i)).toBeInTheDocument();
>>>>>>> develop
    });

    it("places order on Step 4 and displays OrderConfirmationScreen with tracking", async () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      fillShippingForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
      fillCardForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      const placeOrderBtn = screen.getByRole("button", { name: "PLACE ORDER" });
      fireEvent.click(placeOrderBtn);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Your OCCASION order is confirmed!/i)
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(
        screen.getByText(/Here's what we're packing for you:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Use this number to track your package:/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /continue shopping/i })
      ).toBeInTheDocument();
    });

    it("shows an error message and stays on Review when createOrder fails", async () => {
      createOrder.mockRejectedValueOnce(
        Object.assign(new Error("server error"), {
          data: { message: "การชำระเงินถูกปฏิเสธ กรุณาตรวจสอบข้อมูลบัตร" },
        })
      );

      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      fillShippingForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
      fillCardForm();
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      fireEvent.click(screen.getByRole("button", { name: "PLACE ORDER" }));

      await waitFor(() => {
        expect(
<<<<<<< HEAD
          screen.getByText(/การชำระเงินถูกปฏิเสธ/)
        ).toBeInTheDocument();
=======
          screen.getAllByText(/การชำระเงินถูกปฏิเสธ/).length
        ).toBeGreaterThanOrEqual(1);
>>>>>>> develop
      });

      expect(
        screen.getByRole("button", { name: "PLACE ORDER" })
      ).toBeInTheDocument();
    });
  });
});