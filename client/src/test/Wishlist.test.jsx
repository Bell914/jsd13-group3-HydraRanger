import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useWishlistStore } from "../store/wishlistStore.js";
import { WishlistSection } from "../components/profile/WishlistSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import AuthContext from "../context/Auth/AuthContext.jsx";

const mockAuthValue = (isAuthenticated = true) => ({
  user: isAuthenticated ? { username: "testuser", email: "test@example.com" } : null,
  isAuthenticated,
  login: vi.fn(),
  logout: vi.fn(),
});

describe("Product Wishlist Feature", () => {
  beforeEach(() => {
    useWishlistStore.getState().clearWishlist();
    localStorage.clear();
  });

  describe("wishlistStore", () => {
    it("adds a product and prevents duplicate additions", () => {
      const store = useWishlistStore.getState();
      const product = { _id: "prod-1", name: "เสื้อเชิ้ต", price: 590 };

      store.addToWishlist(product);
      expect(useWishlistStore.getState().wishlist).toHaveLength(1);
      expect(useWishlistStore.getState().isWishlisted("prod-1")).toBe(true);

      // Duplicate addition
      store.addToWishlist(product);
      expect(useWishlistStore.getState().wishlist).toHaveLength(1);
    });

    it("removes and toggles a product correctly", () => {
      const store = useWishlistStore.getState();
      const product = { _id: "prod-2", name: "กางเกงสแล็ค", price: 890 };

      store.toggleWishlist(product);
      expect(useWishlistStore.getState().isWishlisted("prod-2")).toBe(true);

      store.toggleWishlist(product);
      expect(useWishlistStore.getState().isWishlisted("prod-2")).toBe(false);
      expect(useWishlistStore.getState().wishlist).toHaveLength(0);
    });
  });

  describe("WishlistSection component", () => {
    it("renders empty state when there are no saved products", () => {
      render(
        <MemoryRouter>
          <WishlistSection items={[]} />
        </MemoryRouter>
      );

      expect(screen.getByText("ยังไม่มีรายการสินค้าโปรด")).toBeInTheDocument();
      expect(
        screen.getByText("เลือกกดหัวใจที่สินค้าที่คุณสนใจเพื่อบันทึกไว้ดูภายหลัง")
      ).toBeInTheDocument();
      expect(screen.getByText("เลือกดูสินค้า")).toBeInTheDocument();
    });

    it("renders saved products with link to detail and removes product on click", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const items = [
        {
          _id: "prod-10",
          name: "Casual Linen Shirt",
          price: 790,
          category: "tops",
          imageUrl: "/images/shirt.jpg",
        },
      ];

      render(
        <MemoryRouter>
          <WishlistSection items={items} onRemove={onRemove} />
        </MemoryRouter>
      );

      expect(screen.getByText("Casual Linen Shirt")).toBeInTheDocument();
      const detailLinks = screen.getAllByRole("link", { name: "Casual Linen Shirt" });
      expect(detailLinks.length).toBeGreaterThanOrEqual(1);
      detailLinks.forEach((link) => {
        expect(link).toHaveAttribute("href", "/products/prod-10");
      });

      const removeBtn = screen.getByRole("button", { name: "ลบออกจากรายการโปรด" });
      await user.click(removeBtn);
      expect(onRemove).toHaveBeenCalledWith("prod-10");
    });
  });

  describe("ProductCard save button & auth protection", () => {
    const product = {
      _id: "prod-100",
      title: "Relaxed Blazer",
      price: 1290,
      imageUrl: "/images/blazer.jpg",
    };

    it("redirects to /login when non-authenticated user clicks save", async () => {
      const user = userEvent.setup();

      render(
        <AuthContext.Provider value={mockAuthValue(false)}>
          <MemoryRouter initialEntries={["/products"]}>
            <Routes>
              <Route path="/products" element={<ProductCard product={product} />} />
              <Route path="/login" element={<div>Login Page Mock</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const saveBtn = screen.getByRole("button", { name: "บันทึกในรายการโปรด" });
      await user.click(saveBtn);

      expect(screen.getByText("Login Page Mock")).toBeInTheDocument();
      expect(useWishlistStore.getState().isWishlisted("prod-100")).toBe(false);
    });

    it("saves and toggles product when authenticated user clicks save", async () => {
      const user = userEvent.setup();

      render(
        <AuthContext.Provider value={mockAuthValue(true)}>
          <MemoryRouter initialEntries={["/products"]}>
            <Routes>
              <Route path="/products" element={<ProductCard product={product} />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      const saveBtn = screen.getByRole("button", { name: "บันทึกในรายการโปรด" });
      await user.click(saveBtn);

      expect(useWishlistStore.getState().isWishlisted("prod-100")).toBe(true);

      // Button title toggles
      const removeBtn = screen.getByRole("button", { name: "ลบออกจากรายการโปรด" });
      expect(removeBtn).toBeInTheDocument();

      // Click again to cancel
      await user.click(removeBtn);
      expect(useWishlistStore.getState().isWishlisted("prod-100")).toBe(false);
    });
  });
});
