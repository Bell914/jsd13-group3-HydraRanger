import { create } from "zustand";

const STORAGE_KEY = "occasion_cart";

const loadInitialCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load cart:", error);
    return [];
  }
};

const saveCart = (cartItems) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

export const useCartStore = create((set, get) => ({
  cartItems: loadInitialCart(),
  isLoading: false,
  error: null,

  // Getter คำนวณราคารวม
  getTotalPrice: () => {
    return get().cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  },

  // Action เพิ่มสินค้า
  addToCart: ({ product, variant, quantity = 1 }) => {
    const currentItems = get().cartItems;
    const variantId = variant._id || `${product._id}-${variant.color}-${variant.size}`;
    const existingIndex = currentItems.findIndex((item) => item.variantId === variantId);

    let updatedItems;
    if (existingIndex > -1) {
      updatedItems = currentItems.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stockQuantity || 99) }
          : item
      );
    } else {
      const newItem = {
        productId: product._id,
        variantId,
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
  },

  // Action ปรับจำนวน
  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(variantId);
      return;
    }
    const updatedItems = get().cartItems.map((item) =>
      item.variantId === variantId ? { ...item, quantity } : item
    );
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  // Action ลบสินค้า
  removeFromCart: (variantId) => {
    const updatedItems = get().cartItems.filter((item) => item.variantId !== variantId);
    saveCart(updatedItems);
    set({ cartItems: updatedItems });
  },

  clearCart: () => {
    saveCart([]);
    set({ cartItems: [] });
  },
}));

// Export Default สำรองไว้ป้องกัน Import ผิดแบบ
export default useCartStore;
