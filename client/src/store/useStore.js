import { create } from "zustand";

const counterStore = (set) => ({
  count: 0,
  text: "",
  item: "",
  setItems: (val) => set({ item: val || [] }),
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setText: (val) => set({ text: val }),
});

export const useCounterStore = create(counterStore);
