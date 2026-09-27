import { create } from "zustand";

const STORAGE_KEY = "occasion_cart";
// Ceiling for lines whose stock is unknown, so a legacy cart cannot be pushed to an
// absurd quantity while the server keeps the final say on availability.
const MAX_UNKNOWN_STOCK = 99;

export const migrateCartItem = (item) => {
  if (!item || item.cartItemId) return item;

  const variantId = item.variantId || item.variant_id;
  if (!variantId) return item;

  const cartItemId = item.isLookbookSet || item.lookbookId
    ? `${variantId}:lookbook:${item.lookbookId || "set"}`
    : String(variantId);

  return { ...item, cartItemId };
};


const loadInitialCart = () => {
  try {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    const migrated = parsed.map(migrateCartItem);
    if (migrated.some((item, index) => item !== parsed[index])) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
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

// Returns null when a line carries no stock snapshot. Carts saved before the field
// existed have none, and reading that as 0 is what leaves the quantity stepper disabled
// for good and makes updateQuantity drop the line on the next press.
const readStock = (item) => {
  const raw = item?.stockQuantity ?? item?.stock_quantity ?? item?.stock;
  if (raw === undefined || raw === null || raw === "") return null;
  const stock = Number(raw);
  return Number.isFinite(stock) ? Math.max(0, stock) : null;
};

// Stock arrives from a freshly fetched variant at add time, where a missing value still
// means the product cannot be bought.
const getStock = (variant) => readStock(variant) ?? 0;

const getVariantId = (variant, product) => {
  const productId = product._id || product.productId || "product";
  const colorKey = variant.color || "std";
  const sizeKey = variant.size || "std";
  return String(variant._id || variant.variant_id || `${productId}-${colorKey}-${sizeKey}`);
};

const getCartItemId = (item) => item.cartItemId || item.variantId;

export const quantityInCartForVariant = (items, variantId) => items.reduce(
  (total, item) => (String(item.variantId || item.variant_id) === String(variantId)
    ? total + Number(item.quantity || 0)
    : total),
  0,
);

// A lookbook set is stored as one line per SKU, all sharing the same lookbookId, so a
// set is only as large as the scarcest SKU it contains.
const getSetGroup = (items, target) => {
  if (!target?.isLookbookSet) return target ? [target] : [];
  return items.filter(
    (item) => item.isLookbookSet && String(item.lookbookId) === String(target.lookbookId)
  );
};

// How many more of this line the cart can hold, counting the SKUs its sibling set lines
// already claim. Returns null when nothing in the group reports a stock snapshot, so a
// legacy cart is not blocked by a value it never had.
export const getAvailableQuantity = (items, cartItemId) => {
  const target = items.find((item) => getCartItemId(item) === cartItemId);
  if (!target) return null;

  const group = getSetGroup(items, target);
  if (group.length === 0) return null;
  const groupIds = new Set(group.map((item) => getCartItemId(item)));

  let available = null;
  for (const line of group) {
    const stock = readStock(line);
    if (stock === null) continue;

    const claimedElsewhere = quantityInCartForVariant(
      items.filter((other) => !groupIds.has(getCartItemId(other))),
      line.variantId
    );

    const remaining = Math.max(0, stock - claimedElsewhere);
    available = available === null ? remaining : Math.min(available, remaining);
  }

  return available;
};


export const useCartStore = create((set, get) => ({
  cartItems: loadInitialCart(),

  addToCart: ({ product, variant, quantity = 1 }) => {
    const currentItems = get().cartItems;
    const stockQuantity = getStock(variant);
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || stockQuantity === 0) {
      return { added: false, items: currentItems };
    }

    const realVariantId = variant._id || variant.variant_id;
    const variantId = getVariantId(variant, product);
    const existingQuantity = quantityInCartForVariant(currentItems, variantId);

    // Keep the cart's total for this SKU within the stock reported by the API.
    if (existingQuantity + requestedQuantity > stockQuantity) {
      return { added: false, items: currentItems };
    }

    const existingIndex = currentItems.findIndex(
      (item) => !item.isLookbookSet && (item.variantId === variantId || (realVariantId && item.variant_id === realVariantId))
    );

    let updatedItems;
    if (existingIndex > -1) {
      updatedItems = currentItems.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + requestedQuantity;
          return {
            ...item,
            quantity: newQty,
            stockQuantity,
          };
        }
        return item;
      });
    } else {
      const newItem = {
        productId: product._id || product.productId,
        product_id: product._id || product.productId,
        cartItemId: variantId,
        variantId,
        variant_id: realVariantId || variantId,
        sku: variant.sku || "",
        name: product.name || product.title,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        imageUrl: variant.imageUrl || product.imageUrl,
        quantity: requestedQuantity,
        stockQuantity,
      };
      updatedItems = [...currentItems, newItem];
    }

    saveCart(updatedItems);
    set({ cartItems: updatedItems });
    return { added: true, items: updatedItems };
  },

  addLookbookSet: ({ lookbook, items }) => {
    const currentItems = [...get().cartItems];

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

    const setId = String(lookbook.id || lookbook.lookbookId || "set");
    const requestedByVariant = new Map();
    for (const { product, variant, quantity = 1 } of itemsToAdd) {
      const requestedQuantity = Number(quantity);
      const variantId = getVariantId(variant, product);
      const stockQuantity = getStock(variant);
      if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || stockQuantity === 0) {
        return { added: false, items: get().cartItems };
      }
      const requested = (requestedByVariant.get(variantId) || 0) + requestedQuantity;
      if (quantityInCartForVariant(currentItems, variantId) + requested > stockQuantity) {
        return { added: false, items: get().cartItems };
      }
      requestedByVariant.set(variantId, requested);
    }

    for (const it of itemsToAdd) {
      const { product, variant, quantity = 1, discountedPrice, originalPrice } = it;
      const stockQuantity = getStock(variant);
      const realVariantId = variant._id || variant.variant_id;
      const variantId = getVariantId(variant, product);
      const cartItemId = `${variantId}:lookbook:${setId}`;

      const existingIndex = currentItems.findIndex(
        (item) => getCartItemId(item) === cartItemId
      );

      if (existingIndex > -1) {
        const existing = currentItems[existingIndex];
        const newQty = existing.quantity + Number(quantity);
        currentItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          stockQuantity,
          price: discountedPrice,
          originalPrice,
          lookbookId: setId,
          lookbookName: lookbook.nameTh || lookbook.name,
          lookbookSetSize: itemsToAdd.length,
          isLookbookSet: true,
        };
      } else {
        const newItem = {
          productId: product._id || product.productId,
          product_id: product._id || product.productId,
          cartItemId,
          variantId,
          variant_id: realVariantId || variantId,
          sku: variant.sku || "",
          name: product.name || product.title,
          color: variant.color,
          size: variant.size,
          price: discountedPrice,
          originalPrice,
          imageUrl: variant.imageUrl || product.imageUrl,
          quantity: Number(quantity),
          stockQuantity,
          lookbookId: setId,
          lookbookName: lookbook.nameTh || lookbook.name,
          lookbookSetSize: itemsToAdd.length,
          isLookbookSet: true,
        };
        currentItems.push(newItem);
      }
    }

    saveCart(currentItems);
    set({ cartItems: currentItems });
    return { added: true, items: currentItems };
  },

  removeFromCart: (cartItemId) => {
    const currentItems = get().cartItems;
    const target = currentItems.find((item) => getCartItemId(item) === cartItemId);
    // A set is priced as one bundle. Removing only one line would leave the remaining
    // lines with a bundle price even though the set is no longer complete.
    const updatedItems = target?.isLookbookSet
      ? currentItems.filter(
        (item) => !(item.isLookbookSet && String(item.lookbookId) === String(target.lookbookId))
      )
      : currentItems.filter((item) => getCartItemId(item) !== cartItemId);
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  updateQuantity: (cartItemId, quantity) => {
    const currentItems = get().cartItems;
    if (!currentItems.some((item) => getCartItemId(item) === cartItemId)) return;

    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }

    // For a set the scarcest SKU in the group sets the cap, not just this line's stock.
    const available = getAvailableQuantity(currentItems, cartItemId);
    const requested = Math.max(1, Number(quantity) || 1);
    const nextQuantity = available === null
      ? Math.min(requested, MAX_UNKNOWN_STOCK)
      : Math.min(requested, available);

    // Keep every line in a lookbook set at the same set quantity. This preserves the
    // client total as the same complete-set total the server will calculate.
    const target = currentItems.find((item) => getCartItemId(item) === cartItemId);
    const updatedItems = target?.isLookbookSet
      ? currentItems.map((item) => (
        item.isLookbookSet && String(item.lookbookId) === String(target.lookbookId)
          ? { ...item, quantity: nextQuantity }
          : item
      ))
      : currentItems.map((item) =>
        (getCartItemId(item) === cartItemId ? { ...item, quantity: nextQuantity } : item)
      );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
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
