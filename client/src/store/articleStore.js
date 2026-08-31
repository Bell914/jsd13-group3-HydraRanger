import { useState } from "react";
import { create } from "zustand";
import { fashionNews } from "../assets/assets";
const articleStore = (set) => ({
  articles: fashionNews,
  currentPage: 1,
  itemsPerPage: 6,
  selectedCategory: "All",
  setPage: (page) => set({ currentPage: page }),
});

export const useArticleStore = create(articleStore);
