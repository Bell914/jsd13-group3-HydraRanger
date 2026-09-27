import { beforeEach, describe, expect, it } from "vitest";
import { getAvailableQuantity, migrateCartItem, useCartStore } from "../store/cartStore.js";

const product = { _id: "product-1", name: "Test product" };
const variant = { _id: "variant-1", price: 100, stockQuantity: 2 };

const setCart = (cartItems) => useCartStore.setState({ cartItems });

// A legacy line: saved before the cart tracked stock per line at all.
const legacyLine = (overrides = {}) => ({
  cartItemId: "variant-1",
  productId: "product-1",
  variantId: "variant-1",
  name: "Test product",
  price: 100,
  quantity: 2,
  ...overrides
});

const setLine = (variantId, stockQuantity, quantity = 1) => ({
  cartItemId: `${variantId}:lookbook:LOOK-1`,
  productId: `product-${variantId}`,
  variantId,
  name: "Set item",
  price: 100,
  quantity,
  stockQuantity,
  lookbookId: "LOOK-1",
  isLookbookSet: true
});
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

  it("assigns stable line IDs to legacy cart items", () => {
    expect(migrateCartItem({ variantId: "variant-1" }).cartItemId).toBe("variant-1");
    expect(migrateCartItem({
      variantId: "variant-1",
      isLookbookSet: true,
      lookbookId: "LOOK-1",
    }).cartItemId).toBe("variant-1:lookbook:LOOK-1");
  });
});
describe("cart lines that carry no stock snapshot", () => {
  beforeEach(() => {
    setCart([]);
  });

  it("reports no limit instead of reading the missing value as zero", () => {
    const cart = [legacyLine()];
    expect(getAvailableQuantity(cart, "variant-1")).toBeNull();
  });

  it("still lets the quantity go up, so the stepper is not dead on arrival", () => {
    setCart([legacyLine()]);

    useCartStore.getState().updateQuantity("variant-1", 3);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(3);
  });

  it("keeps a legacy line while another line is being changed", () => {
    setCart([legacyLine(), legacyLine({ cartItemId: "variant-2", variantId: "variant-2" })]);

    useCartStore.getState().updateQuantity("variant-2", 3);

    const cart = useCartStore.getState().cartItems;
    expect(cart).toHaveLength(2);
    expect(cart.find((item) => item.cartItemId === "variant-1").quantity).toBe(2);
  });

  it("caps the amount rather than accepting an absurd quantity", () => {
    setCart([legacyLine()]);

    useCartStore.getState().updateQuantity("variant-1", 5000);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(99);
  });
});

describe("lookbook set stock", () => {
  beforeEach(() => {
    setCart([]);
  });

  it("caps a set by the scarcest SKU it contains", () => {
    setCart([setLine("variant-a", 6), setLine("variant-b", 2)]);

    useCartStore.getState().updateQuantity("variant-a:lookbook:LOOK-1", 5);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });

  it("counts what a regular line already holds of the same SKU", () => {
    setCart([
      legacyLine({ quantity: 3, stockQuantity: 5 }),
      setLine("variant-1", 5, 1)
    ]);

    useCartStore.getState().updateQuantity("variant-1:lookbook:LOOK-1", 3);

    // Five in stock, three already on the regular line, leaves two for the set.
    expect(useCartStore.getState().cartItems[1].quantity).toBe(2);
  });

  it("leaves a set from another lookbook alone", () => {
    const other = { ...setLine("variant-c", 4), cartItemId: "variant-c:lookbook:LOOK-2", lookbookId: "LOOK-2" };
    setCart([setLine("variant-a", 1), other]);

    expect(getAvailableQuantity(useCartStore.getState().cartItems, "variant-c:lookbook:LOOK-2")).toBe(4);
  });
});
