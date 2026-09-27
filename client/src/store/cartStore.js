import { create } from "zustand";

const STORAGE_KEY = "occasion_cart";

const loadInitialCart = () => {
  try {
    if (typeof localStorage === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
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

const getStock = (variant) => {
  const stock = Number(variant.stockQuantity ?? variant.stock_quantity ?? variant.stock ?? 0);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

const getVariantId = (variant, product) => {
  const productId = product._id || product.productId || "product";
  const colorKey = variant.color || "std";
  const sizeKey = variant.size || "std";
  return String(variant._id || variant.variant_id || `${productId}-${colorKey}-${sizeKey}`);
};

const getCartItemId = (item) => item.cartItemId || item.variantId;

const quantityInCartForVariant = (items, variantId) => items.reduce(
  (total, item) => (String(item.variantId || item.variant_id) === String(variantId)
    ? total + Number(item.quantity || 0)
    : total),
  0,
);

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
    const updatedItems = get().cartItems.filter(
      (item) => getCartItemId(item) !== cartItemId
    );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(cartItemId);
      return;
    }
    const updatedItems = get().cartItems
      .filter((item) => getCartItemId(item) !== cartItemId || getStock(item) > 0)
      .map((item) => {
        if (getCartItemId(item) !== cartItemId) return item;

        return {
          ...item,
          quantity: Math.min(
            quantity,
            Math.max(
              0,
              getStock(item) - quantityInCartForVariant(
                get().cartItems.filter((other) => getCartItemId(other) !== cartItemId),
                item.variantId,
              ),
            ),
          ),
        };
      });
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
