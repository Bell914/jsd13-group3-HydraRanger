import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach, vi } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import CartPage from "../pages/CartPage";
import { useCartStore } from "../store/cartStore";

describe("Cart & Checkout Flow", () => {
  beforeEach(() => {
    // Populate store with a mock product
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

      expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
      expect(screen.getByText("Oversized T-Shirt")).toBeInTheDocument();
      expect(screen.getByText("Off White")).toBeInTheDocument();
      expect(screen.getByText("Size M")).toBeInTheDocument();
      expect(screen.getAllByText("฿1180").length).toBeGreaterThanOrEqual(1);

      // Proceed to Checkout button
      const checkoutBtn = screen.getByRole("link", {
        name: /proceed to checkout/i,
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

      // In step 2, Shipping heading and continue button are visible
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

      // Click CONTINUE from Step 2 to move to Step 3
      const continueBtn = screen.getByRole("button", { name: "CONTINUE" });
      fireEvent.click(continueBtn);

      // Now on Step 3 Payment
      expect(screen.getByText("Use my Gift Card")).toBeInTheDocument();

      // Verify Back button ("ย้อนกลับ") is present on Step 3
      const backBtn = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backBtn).toBeInTheDocument();

      // Click Back button to return to Step 2
      fireEvent.click(backBtn);
      expect(screen.getByLabelText("First name")).toBeInTheDocument();
    });

    it("navigates to Step 4 Review and has Back button that returns to Step 3", () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      // Step 2 -> Step 3
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      // Step 3 -> Step 4
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      // Now on Step 4 Review
      expect(
        screen.getByRole("button", { name: "PLACE ORDER" })
      ).toBeInTheDocument();

      // Verify Back button ("ย้อนกลับ") is present on Step 4
      const backBtn = screen.getByRole("button", { name: "ย้อนกลับ" });
      expect(backBtn).toBeInTheDocument();

      // Click Back button to return to Step 3
      fireEvent.click(backBtn);
      expect(screen.getByText("Use my Gift Card")).toBeInTheDocument();
    });

    it("places order on Step 4 and displays OrderConfirmationScreen with tracking", async () => {
      render(
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      );

      // Step 2 -> Step 3 -> Step 4
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
      fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));

      // Click PLACE ORDER
      const placeOrderBtn = screen.getByRole("button", { name: "PLACE ORDER" });
      fireEvent.click(placeOrderBtn);

      // Wait for Order Confirmation screen to appear
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
  });
});
