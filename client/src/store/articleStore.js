import { create } from "zustand";
import { getArticles } from "../services/articleService.js";

export const useArticleStore = create((set, get) => ({
  articles: [],
  loading: false,
  error: "",
  currentPage: 1,
  itemsPerPage: 9,
  totalPages: 1,
  total: 0,
  selectedCategory: "All",

  setPage: (page) => set({ currentPage: page }),
  setCategory: (category) => set({ selectedCategory: category }),

  fetchArticles: async ({ page, category } = {}) => {
    const currentPage = page || get().currentPage;
    const selectedCategory = category !== undefined ? category : get().selectedCategory;
    const limit = get().itemsPerPage;

    set({ loading: true, error: "", currentPage });

    try {
      const { articles, pagination } = await getArticles({
        page: currentPage,
        limit,
        category: selectedCategory === "All" ? "" : selectedCategory,
      });
      set({
        articles,
        totalPages: pagination.totalPages || 1,
        total: pagination.total || articles.length,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message || "โหลดบทความไม่สำเร็จ",
        loading: false,
      });
    }
  },
}));

export default useArticleStore;