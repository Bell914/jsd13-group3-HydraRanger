import { create } from "zustand";

const counterStore = (set) => ({
  count: 0,
  text: "",
  searchQuery: "",
  item: "",
  searchOpen: false,
  setItems: (val) => set({ item: val || [] }),
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setText: (val) => set({ text: val }),
  setSearchOpen: (isOpen) => set({ searchOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
});

export const useCounterStore = create(counterStore);
