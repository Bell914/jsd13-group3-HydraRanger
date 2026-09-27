import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import CartPage from "../pages/CartPage.jsx";
import useCartStore from "../store/cartStore.js";

const setCart = (cartItems) => {
  useCartStore.setState({ cartItems });
};

const plusButton = () => screen.getByRole("button", { name: "Increase quantity" });
const minusButton = () => screen.getByRole("button", { name: "Decrease quantity" });

describe("CartPage quantity controls", () => {
  beforeEach(() => {
    setCart([]);
  });

  it("increases a legacy line that was saved without a stock snapshot", () => {
    // Saved by an older build: no cartItemId and no stockQuantity at all.
    setCart([{ variantId: "v1", name: "Oversized T-Shirt", price: 590, quantity: 2 }]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    // The stepper used to be born disabled, so pressing + appeared to do nothing.
    expect(plusButton()).toBeEnabled();
    fireEvent.click(plusButton());

    expect(useCartStore.getState().cartItems[0].quantity).toBe(3);
  });

  it("stops the stepper once the line reaches its stock", () => {
    setCart([
      { cartItemId: "ci-1", variantId: "v1", name: "Oversized T-Shirt", price: 590, quantity: 5, stockQuantity: 5 },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    expect(plusButton()).toBeDisabled();
  });

  it("disables the stepper on a set that another line has used up", () => {
    setCart([
      { cartItemId: "ci-1", variantId: "v1", name: "T-Shirt", price: 590, quantity: 3, stockQuantity: 5 },
      {
        cartItemId: "ci-2",
        variantId: "v1",
        name: "T-Shirt",
        price: 590,
        quantity: 2,
        stockQuantity: 5,
        lookbookId: "look-1",
        isLookbookSet: true,
      },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    // Five in stock, three already on the standalone line, so the set stops at two.
    const [, setLine] = useCartStore.getState().cartItems;
    const setQuantity = screen.getByText(String(setLine.quantity));
    expect(setQuantity).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Increase quantity" })[1]).toBeDisabled();
  });

  it("decreases only the line that was clicked", () => {
    setCart([
      { cartItemId: "ci-1", variantId: "v1", name: "T-Shirt", price: 590, quantity: 3, stockQuantity: 5 },
      { cartItemId: "ci-2", variantId: "v1", name: "T-Shirt", price: 590, quantity: 1, stockQuantity: 5, lookbookId: "look-1", isLookbookSet: true },
    ]);

    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Decrease quantity" })[1]);

    // Dropping to zero removes just that line; the standalone line of the same SKU stays.
    const remaining = useCartStore.getState().cartItems;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].cartItemId).toBe("ci-1");
    expect(remaining[0].quantity).toBe(3);
  });
});
