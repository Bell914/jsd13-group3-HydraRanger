import { beforeEach, describe, expect, it } from "vitest";

import useCartStore, {
  getAvailableQuantity,
  migrateCart,
} from "../store/cartStore.js";

const setCart = (cartItems) => {
  useCartStore.setState({ cartItems });
};

const makeVariant = (overrides = {}) => ({
  _id: "v1",
  sku: "SKU-1",
  color: "Black",
  size: "M",
  price: 590,
  stockQuantity: 5,
  ...overrides,
});

const makeProduct = (overrides = {}) => ({
  _id: "p1",
  name: "Oversized T-Shirt",
  ...overrides,
});

const standalone = (overrides = {}) => ({
  cartItemId: "ci-standalone",
  productId: "p1",
  variantId: "v1",
  sku: "SKU-1",
  name: "Oversized T-Shirt",
  price: 590,
  quantity: 2,
  stockQuantity: 5,
  ...overrides,
});

const setLine = (overrides = {}) => ({
  cartItemId: "ci-set-a",
  productId: "p2",
  variantId: "v9",
  sku: "SKU-9",
  name: "Set item A",
  price: 400,
  quantity: 1,
  stockQuantity: 4,
  lookbookId: "look-1",
  lookbookName: "City Set",
  isLookbookSet: true,
  ...overrides,
});

describe("migrateCart", () => {
  it("gives every legacy line its own id so set lines stop colliding with products", () => {
    const legacy = [
      { variantId: "v1", quantity: 1, isLookbookSet: true, lookbookId: "look-1" },
      { variantId: "v1", quantity: 1 },
      { variantId: "v2", quantity: 1, isLookbookSet: true, lookbookId: "look-1" },
    ];

    const migrated = migrateCart(legacy);

    expect(migrated).toHaveLength(3);
    expect(migrated.every((item) => Boolean(item.cartItemId))).toBe(true);
    expect(new Set(migrated.map((item) => item.cartItemId)).size).toBe(3);
  });

  it("keeps an id that a line already has", () => {
    const migrated = migrateCart([{ cartItemId: "ci-existing", variantId: "v1" }]);
    expect(migrated[0].cartItemId).toBe("ci-existing");
  });

  it("survives a cart that is not an array", () => {
    expect(migrateCart([])).toEqual([]);
  });
});

describe("getAvailableQuantity", () => {
  it("reports no limit for a legacy line that carries no stock snapshot", () => {
    const cart = [{ cartItemId: "ci-old", variantId: "v1", quantity: 2 }];
    expect(getAvailableQuantity(cart, cart[0])).toBeNull();
  });

  it("counts what the other lines already claim against the same SKU", () => {
    const cart = [
      standalone({ quantity: 2, stockQuantity: 5 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v1", stockQuantity: 5 }),
    ];

    // The set line is capped by 5 - 2 already claimed by the standalone line.
    expect(getAvailableQuantity(cart, cart[1])).toBe(3);
  });

  it("caps a set by the scarcest SKU across the whole set", () => {
    const cart = [
      setLine({ cartItemId: "ci-set-a", variantId: "v9", stockQuantity: 4 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v8", stockQuantity: 2 }),
    ];

    expect(getAvailableQuantity(cart, cart[0])).toBe(2);
    expect(getAvailableQuantity(cart, cart[1])).toBe(2);
  });

  it("keeps a standalone product out of another set's budget", () => {
    const cart = [
      setLine({ cartItemId: "ci-set-a", variantId: "v9", stockQuantity: 4 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v8", stockQuantity: 4 }),
    ];

    expect(getAvailableQuantity(cart, cart[0])).toBe(4);
  });
});

describe("cart quantity updates", () => {
  beforeEach(() => {
    setCart([]);
  });

  it("changes only the line it was asked about", () => {
    setCart([
      standalone({ quantity: 2 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v1", quantity: 1 }),
    ]);

    useCartStore.getState().updateQuantity("ci-standalone", 4);

    const [own, sibling] = useCartStore.getState().cartItems;
    expect(own.quantity).toBe(4);
    expect(sibling.quantity).toBe(1);
  });

  it("removes only the line it was asked about", () => {
    setCart([
      standalone({ quantity: 2 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v1", quantity: 1 }),
    ]);

    useCartStore.getState().removeFromCart("ci-standalone");

    expect(useCartStore.getState().cartItems).toHaveLength(1);
    expect(useCartStore.getState().cartItems[0].cartItemId).toBe("ci-set-b");
  });

  it("caps a set at the scarcest SKU instead of its own line's stock", () => {
    setCart([
      setLine({ cartItemId: "ci-set-a", variantId: "v9", stockQuantity: 6 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v8", stockQuantity: 2 }),
    ]);

    useCartStore.getState().updateQuantity("ci-set-a", 5);

    // v8 only has 2, so the shared set quantity cannot go past it.
    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });

  it("stops incrementing a set once the other lines claim the remaining stock", () => {
    setCart([
      standalone({ quantity: 3, stockQuantity: 5 }),
      setLine({ cartItemId: "ci-set-b", variantId: "v1", stockQuantity: 5, quantity: 1 }),
    ]);

    useCartStore.getState().updateQuantity("ci-set-b", 3);

    // 5 in stock minus the 3 the standalone line holds leaves 2, already the current value.
    expect(useCartStore.getState().cartItems[1].quantity).toBe(2);
  });

  it("lets a legacy line be increased instead of freezing the stepper", () => {
    setCart([{ cartItemId: "ci-old", variantId: "v1", quantity: 2 }]);

    useCartStore.getState().updateQuantity("ci-old", 3);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(3);
  });

  it("drops the line when the quantity reaches zero", () => {
    setCart([standalone({ quantity: 1 })]);

    useCartStore.getState().updateQuantity("ci-standalone", 0);

    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  it("ignores an id that is not in the cart", () => {
    setCart([standalone({ quantity: 2 })]);

    useCartStore.getState().updateQuantity("ci-missing", 9);

    expect(useCartStore.getState().cartItems[0].quantity).toBe(2);
  });
});

describe("adding products and sets", () => {
  beforeEach(() => {
    setCart([]);
  });

  it("gives a new product line an id", () => {
    useCartStore.getState().addToCart({ product: makeProduct(), variant: makeVariant() });

    const [item] = useCartStore.getState().cartItems;
    expect(item.cartItemId).toBeTruthy();
    expect(item.isLookbookSet).toBeUndefined();
  });

  it("merges a repeat purchase into the existing standalone line", () => {
    useCartStore.getState().addToCart({ product: makeProduct(), variant: makeVariant() });
    useCartStore.getState().addToCart({ product: makeProduct(), variant: makeVariant() });

    const items = useCartStore.getState().cartItems;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("keeps a standalone product separate when a set containing the same SKU is added", () => {
    useCartStore.getState().addToCart({
      product: makeProduct(),
      variant: makeVariant(),
    });

    useCartStore.getState().addLookbookSet({
      lookbook: { id: "look-1", nameTh: "City Set", setPrice: 400 },
      items: [
        { product: makeProduct(), variant: makeVariant({ price: 400 }), quantity: 1 },
      ],
    });

    const items = useCartStore.getState().cartItems;
    expect(items).toHaveLength(2);

    const standaloneItem = items.find((item) => !item.isLookbookSet);
    const setItem = items.find((item) => item.isLookbookSet);
    expect(standaloneItem.quantity).toBe(1);
    expect(standaloneItem.isLookbookSet).toBeUndefined();
    expect(setItem.isLookbookSet).toBe(true);
    expect(standaloneItem.cartItemId).not.toBe(setItem.cartItemId);
  });

  it("merges a repeat set into the lines of that same set", () => {
    const lookbook = { id: "look-1", nameTh: "City Set", setPrice: 400 };
    const items = [
      { product: makeProduct(), variant: makeVariant({ price: 400 }), quantity: 1 },
    ];

    useCartStore.getState().addLookbookSet({ lookbook, items });
    useCartStore.getState().addLookbookSet({ lookbook, items });

    const cart = useCartStore.getState().cartItems;
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });
});
