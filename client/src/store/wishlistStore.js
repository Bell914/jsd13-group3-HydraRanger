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

const resolveId = (product) => {
  if (!product) return null;
  const rawId =
    product._id ||
    product.productId ||
    product.id ||
    product.sku ||
    (typeof product === "string" ? product : null);
  return rawId ? String(rawId) : null;
};

export const useWishlistStore = create((set, get) => ({
  wishlist: loadInitialWishlist(),

  isWishlisted: (productId) => {
    const id = resolveId(productId);
    if (!id) return false;
    return get().wishlist.some((item) => String(item._id) === id);
  },

  addToWishlist: (product) => {
    const id = resolveId(product);
    if (!id || get().isWishlisted(id)) return get().wishlist;

    let price = Number(product.price ?? product.basePrice);
    if (isNaN(price) || price <= 0) {
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variantPrice = Number(product.variants[0].price);
        price = !isNaN(variantPrice) && variantPrice > 0 ? variantPrice : 490;
      } else {
        price = 490;
      }
    }

    const newItem = {
      _id: id,
      name: product.name || product.title || "สินค้า",
      imageUrl:
        product.imageUrl ||
        product.image ||
        product.images?.[0]?.image_url ||
        product.variants?.[0]?.imageUrl ||
        "",
      price,
      category: product.category || product.category_id?.name || "",
    };
    const updated = [...get().wishlist, newItem];
    saveWishlist(updated);
    set({ wishlist: updated });
    return updated;
  },

  removeFromWishlist: (productId) => {
    const id = resolveId(productId);
    if (!id) return get().wishlist;
    const updated = get().wishlist.filter((item) => String(item._id) !== id);
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