import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "../store/cartStore.js";

const product = { _id: "product-1", name: "Test product" };
const variant = { _id: "variant-1", price: 100, stockQuantity: 2 };

describe("cart stock and lookbook pricing", () => {
  beforeEach(() => {
    useCartStore.setState({ cartItems: [] });
  });

  it("rejects an add when the cart already holds all available stock", () => {
    expect(useCartStore.getState().addToCart({ product, variant, quantity: 2 }).added).toBe(true);

    const result = useCartStore.getState().addToCart({ product, variant, quantity: 1 });

    expect(result.added).toBe(false);
    expect(useCartStore.getState().cartItems).toHaveLength(1);
    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });

  it("keeps a regular line separate from the discounted lookbook line", () => {
    useCartStore.getState().addToCart({ product, variant, quantity: 1 });

    const result = useCartStore.getState().addLookbookSet({
      lookbook: { lookbookId: "LOOK-1", setPrice: 150 },
      items: [
        { product, variant, quantity: 1, originalPrice: 100 },
        {
          product: { _id: "product-2", name: "Second product" },
          variant: { _id: "variant-2", price: 100, stockQuantity: 1 },
          quantity: 1,
          originalPrice: 100,
        },
      ],
    });

    expect(result.added).toBe(true);
    const matchingLines = useCartStore.getState().cartItems.filter((item) => item.variantId === "variant-1");
    expect(matchingLines).toHaveLength(2);
    expect(matchingLines.find((item) => !item.isLookbookSet)).toMatchObject({ price: 100, quantity: 1 });
    expect(matchingLines.find((item) => item.isLookbookSet)).toMatchObject({ price: 75, quantity: 1 });
  });
});
