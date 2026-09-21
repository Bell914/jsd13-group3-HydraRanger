import { create } from "zustand";

const STORAGE_KEY = "occasion_wishlist";

const loadInitialWishlist = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load wishlist from localStorage:", error);
    return [];
  }
};

const saveWishlist = (wishlist) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error("Failed to save wishlist to localStorage:", error);
  }
};

const resolveId = (product) =>
  product?._id || product?.productId || product?.id || product?.sku || null;

export const useWishlistStore = create((set, get) => ({
  wishlist: loadInitialWishlist(),

  isWishlisted: (productId) =>
    get().wishlist.some((item) => item._id === productId),

  addToWishlist: (product) => {
    const id = resolveId(product);
    if (!id || get().isWishlisted(id)) return get().wishlist;
    const newItem = {
      _id: id,
      name: product.name || "สินค้า",
      imageUrl: product.imageUrl || product.image || "",
      price: product.price ?? product.basePrice ?? 490,
      category: product.category || "",
    };
    const updated = [...get().wishlist, newItem];
    saveWishlist(updated);
    set({ wishlist: updated });
    return updated;
  },

  removeFromWishlist: (productId) => {
    const updated = get().wishlist.filter((item) => item._id !== productId);
    saveWishlist(updated);
    set({ wishlist: updated });
    return updated;
  },

  toggleWishlist: (product) => {
    const id = resolveId(product);
    if (!id) return;
    if (get().isWishlisted(id)) {
      get().removeFromWishlist(id);
    } else {
      get().addToWishlist(product);
    }
  },

  clearWishlist: () => {
    saveWishlist([]);
    set({ wishlist: [] });
  },
}));

export default useWishlistStore;