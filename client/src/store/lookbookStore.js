import { create } from "zustand";

const STORAGE_KEY = "occasion_favorite_lookbooks";

const loadInitialFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load favorite lookbooks from localStorage:", error);
    return [];
  }
};

const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorite lookbooks to localStorage:", error);
  }
};

export const useLookbookStore = create((set, get) => ({
  favorites: loadInitialFavorites(),

  isFavorite: (lookId) => get().favorites.some((item) => item.id === lookId),

  toggleFavorite: (look) => {
    if (!look?.id) return get().favorites;
    if (get().isFavorite(look.id)) {
      const updated = get().favorites.filter((item) => item.id !== look.id);
      saveFavorites(updated);
      set({ favorites: updated });
      return updated;
    }
    const newItem = {
      id: look.id,
      name: look.name || "",
      nameTh: look.nameTh || look.name || "",
      image: look.image || "",
      concept: look.concept || "",
      styleTags: look.styleTags || [],
      setPrice: look.setPrice || 0,
      regularPrice: look.regularPrice || 0,
      saving: look.saving || 0,
      itemsCount: look.items?.length || 2,
    };
    const updated = [...get().favorites, newItem];
    saveFavorites(updated);
    set({ favorites: updated });
    return updated;
  },

  removeFavorite: (lookId) => {
    const updated = get().favorites.filter((item) => item.id !== lookId);
    saveFavorites(updated);
    set({ favorites: updated });
    return updated;
  },

  clearFavorites: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear favorite lookbooks from localStorage:", error);
    }
    set({ favorites: [] });
  },
}));

export default useLookbookStore;