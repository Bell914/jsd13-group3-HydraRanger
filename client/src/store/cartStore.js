import { create } from "zustand";

const STORAGE_KEY = "occasion_cart";

const loadInitialCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
};

const saveCart = (cart) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

export const useCartStore = create((set, get) => ({
  cartItems: loadInitialCart(),

  addToCart: ({ product, variant, quantity = 1 }) => {
    const currentItems = get().cartItems;
    const variantId = variant._id || variant.sku || `${product._id}-${variant.color}-${variant.size}`;

    const existingIndex = currentItems.findIndex(
      (item) => item.variantId === variantId
    );

    let updatedItems;
    if (existingIndex > -1) {
      updatedItems = currentItems.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + quantity;
          const maxStock = variant.stockQuantity || 99;
          return {
            ...item,
            quantity: Math.min(newQty, maxStock),
          };
        }
        return item;
      });
    } else {
      const newItem = {
        productId: product._id,
        variantId,
        sku: variant.sku || "",
        name: product.name,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        imageUrl: variant.imageUrl || product.imageUrl,
        quantity,
        stockQuantity: variant.stockQuantity || 99,
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
    const updatedItems = get().cartItems.map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: Math.min(quantity, item.stockQuantity || 99) }
        : item
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
