import { create } from "zustand";

const STORAGE_KEY = "occasion_cart";
// Ceiling for lines whose stock is unknown, so a legacy cart cannot be pushed to an
// absurd quantity while the server still has the final say on availability.
const MAX_UNKNOWN_STOCK = 99;

const createCartItemId = () =>
  `ci-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const isSetLine = (item) => Boolean(item?.isLookbookSet);

const toQuantity = (value) => {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
};

// Returns null when the line carries no stock snapshot. Carts saved before the field
// existed have none, and treating that as 0 is what used to disable the stepper for good.
const readStock = (item) => {
  const raw = item?.stockQuantity ?? item?.stock_quantity ?? item?.stock;
  if (raw === undefined || raw === null || raw === "") return null;
  const stock = Number(raw);
  return Number.isFinite(stock) ? Math.max(0, stock) : null;
};

const sameVariant = (a, b) => {
  if (!a || !b) return false;
  if (a.variantId && b.variantId) return a.variantId === b.variantId;
  return Boolean(a.variant_id) && a.variant_id === b.variant_id;
};

// Every line needs its own identity. Without it a product bought on its own and the
// same SKU inside a lookbook set are indistinguishable, so the quantity controls
// change both at once and the set hides the standalone product.
export const migrateCart = (items) =>
  items.map((item) => ({
    ...item,
    cartItemId: item.cartItemId || createCartItemId(),
  }));

// A lookbook set is stored as one line per SKU, all sharing the same lookbookId, so
// the set is only as large as the scarcest SKU it contains.
const getGroupLines = (cartItems, target) =>
  isSetLine(target)
    ? cartItems.filter(
        (item) => isSetLine(item) && item.lookbookId === target.lookbookId
      )
    : [target];

// How many more of this line the cart can hold, accounting for the SKUs its siblings
// already claim and for the whole set when the line belongs to one.
export const getAvailableQuantity = (cartItems, target) => {
  if (!target) return null;

  const group = getGroupLines(cartItems, target);
  if (group.length === 0) return null;
  const groupIds = new Set(group.map((item) => item.cartItemId));

  let available = null;
  for (const line of group) {
    const stock = readStock(line);
    if (stock === null) continue;

    const claimedElsewhere = cartItems
      .filter(
        (item) => !groupIds.has(item.cartItemId) && sameVariant(item, line)
      )
      .reduce((sum, item) => sum + toQuantity(item.quantity), 0);

    const remaining = Math.max(0, stock - claimedElsewhere);
    available = available === null ? remaining : Math.min(available, remaining);
  }

  return available;
};

const loadInitialCart = () => {
  try {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    const migrated = migrateCart(parsed);
    // Persist the backfill so the migration only ever runs once per saved cart.
    saveCart(migrated);
    return migrated;
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
};

const saveCart = (cart) => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Stock comes from a freshly fetched variant at add time, where a missing value still
// means "cannot be bought".
const getAddableStock = (variant) => readStock(variant) ?? 0;

const resolveVariantId = (product, variant) => {
  const prodId = product._id || product.productId || "product";
  const realVariantId = variant._id || variant.variant_id;
  return realVariantId
    ? String(realVariantId)
    : `${prodId}-${variant.color || "std"}-${variant.size || "std"}`;
};

export const useCartStore = create((set, get) => ({
  cartItems: loadInitialCart(),

  addToCart: ({ product, variant, quantity = 1 }) => {
    const currentItems = get().cartItems;
    const stockQuantity = getAddableStock(variant);

    // Do not add an item that has no stock.
    if (stockQuantity === 0) return currentItems;

    const realVariantId = variant._id || variant.variant_id;
    const variantId = resolveVariantId(product, variant);

    // Only merge into a standalone line. A set line is a different purchase even when
    // it happens to contain the same SKU.
    const existingIndex = currentItems.findIndex(
      (item) =>
        !isSetLine(item) && sameVariant(item, { variantId, variant_id: realVariantId })
    );

    let updatedItems;
    if (existingIndex > -1) {
      updatedItems = currentItems.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + quantity;
          return {
            ...item,
            quantity: Math.min(newQty, stockQuantity),
          };
        }
        return item;
      });
    } else {
      const newItem = {
        cartItemId: createCartItemId(),
        productId: product._id || product.productId,
        product_id: product._id || product.productId,
        variantId,
        variant_id: realVariantId || variantId,
        sku: variant.sku || "",
        name: product.name || product.title,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        imageUrl: variant.imageUrl || product.imageUrl,
        quantity: Math.min(Math.max(1, Number(quantity) || 1), stockQuantity),
        stockQuantity,
      };
      updatedItems = [...currentItems, newItem];
    }

    saveCart(updatedItems);
    set({ cartItems: updatedItems });
    return updatedItems;
  },

  addLookbookSet: ({ lookbook, items }) => {
    const currentItems = [...get().cartItems];
    const lookbookKey = lookbook.id || lookbook.lookbookId;

    const regularSum = items.reduce(
      (sum, it) => sum + Number(it.variant?.price || it.originalPrice || 0),
      0
    );
    const targetSetPrice = Number(lookbook.setPrice || regularSum);
    const totalSaving = Math.max(0, regularSum - targetSetPrice);

    let allocatedSaving = 0;
    const itemsToAdd = items.map((it, idx) => {
      const origPrice = Number(it.variant?.price || it.originalPrice || 0);
      let itemDiscount = 0;
      if (idx === items.length - 1) {
        itemDiscount = totalSaving - allocatedSaving;
      } else {
        itemDiscount = regularSum > 0 ? Math.round((origPrice / regularSum) * totalSaving) : 0;
        allocatedSaving += itemDiscount;
      }

      const discountedPrice = Math.max(0, origPrice - itemDiscount);
      return {
        ...it,
        discountedPrice,
        originalPrice: origPrice,
      };
    });

    for (const it of itemsToAdd) {
      const { product, variant, quantity = 1, discountedPrice, originalPrice } = it;
      const stockQuantity = getAddableStock(variant);
      if (stockQuantity === 0) continue;

      const realVariantId = variant._id || variant.variant_id;
      const variantId = resolveVariantId(product, variant);

      // Merge only into a line of this same set, so a standalone product of the same
      // SKU is left alone instead of being rewritten as part of the set.
      const existingIndex = currentItems.findIndex(
        (item) =>
          isSetLine(item) &&
          item.lookbookId === lookbookKey &&
          sameVariant(item, { variantId, variant_id: realVariantId })
      );

      if (existingIndex > -1) {
        const existing = currentItems[existingIndex];
        const newQty = existing.quantity + quantity;
        currentItems[existingIndex] = {
          ...existing,
          quantity: Math.min(newQty, stockQuantity),
          price: discountedPrice,
          originalPrice,
          lookbookId: lookbookKey,
          lookbookName: lookbook.nameTh || lookbook.name,
          isLookbookSet: true,
        };
      } else {
        const newItem = {
          cartItemId: createCartItemId(),
          productId: product._id || product.productId,
          product_id: product._id || product.productId,
          variantId,
          variant_id: realVariantId || variantId,
          sku: variant.sku || "",
          name: product.name || product.title,
          color: variant.color,
          size: variant.size,
          price: discountedPrice,
          originalPrice,
          imageUrl: variant.imageUrl || product.imageUrl,
          quantity: Math.min(Math.max(1, Number(quantity) || 1), stockQuantity),
          stockQuantity,
          lookbookId: lookbookKey,
          lookbookName: lookbook.nameTh || lookbook.name,
          isLookbookSet: true,
        };
        currentItems.push(newItem);
      }
    }

    saveCart(currentItems);
    set({ cartItems: currentItems });
    return currentItems;
  },

  removeFromCart: (cartItemId) => {
    const updatedItems = get().cartItems.filter(
      (item) => item.cartItemId !== cartItemId
    );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  updateQuantity: (cartItemId, quantity) => {
    const currentItems = get().cartItems;
    const target = currentItems.find((item) => item.cartItemId === cartItemId);
    if (!target) return;

    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }

    // For a set the scarcest SKU in the group sets the cap, not just this line's stock.
    const available = getAvailableQuantity(currentItems, target);
    const requested = Math.max(1, Number(quantity) || 1);
    const nextQuantity =
      available === null
        ? Math.min(requested, MAX_UNKNOWN_STOCK)
        : Math.min(requested, available);

    const updatedItems = currentItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: nextQuantity } : item
    );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  getAvailableQuantityFor: (cartItemId) => {
    const currentItems = get().cartItems;
    return getAvailableQuantity(
      currentItems,
      currentItems.find((item) => item.cartItemId === cartItemId)
    );
  },

  clearCart: () => {
    saveCart([]);
    set({ cartItems: [] });
  },

  getTotalCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));

export default useCartStore;
