import { create } from "zustand";
import { fashionNews } from "../assets/assets.js";
const articleStore = (set) => ({
  articles: fashionNews,
  currentPage: 1,
  itemsPerPage: 6,
  selectedCategory: "All",
  setPage: (page) => set({ currentPage: page }),
});

export const useArticleStore = create(articleStore);
