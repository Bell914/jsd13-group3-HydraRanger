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

export const useCartStore = create((set, get) => ({
  cartItems: loadInitialCart(),

  addToCart: ({ product, variant, quantity = 1 }) => {
    const currentItems = get().cartItems;
    const stockQuantity = getStock(variant);

    // Do not add an item that has no stock.
    if (stockQuantity === 0) return currentItems;

    const prodId = product._id || product.productId || "product";
    const colorKey = variant.color || "std";
    const sizeKey = variant.size || "std";
    const realVariantId = variant._id || variant.variant_id;
    const variantId = realVariantId
      ? String(realVariantId)
      : `${prodId}-${colorKey}-${sizeKey}`;

    const existingIndex = currentItems.findIndex(
      (item) => item.variantId === variantId || (realVariantId && item.variant_id === realVariantId)
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

  removeFromCart: (variantId) => {
    const updatedItems = get().cartItems.filter(
      (item) => item.variantId !== variantId
    );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(variantId);
      return;
    }
    const updatedItems = get().cartItems
      .filter((item) => item.variantId !== variantId || getStock(item) > 0)
      .map((item) => {
        if (item.variantId !== variantId) return item;

        return {
          ...item,
          quantity: Math.min(quantity, getStock(item)),
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
