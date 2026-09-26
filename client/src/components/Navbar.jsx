import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { assets } from "../assets/assets.js";
import { useCounterStore } from "../store/useStore.js";
import { useCartStore } from "../store/cartStore.js";
import { ProfileDropdown } from "./ProfileDropdown.jsx";
import { SearchModal } from "./SearchModal.jsx";

export const Navbar = () => {
  const searchQuery = useCounterStore((state) => state.searchQuery);
  const setSearchQuery = useCounterStore((state) => state.setSearchQuery);
  const totalCartItems = useCartStore((state) =>
    state.cartItems.reduce((acc, item) => acc + item.quantity, 0),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navRef = useRef(null);
  const searchButtonRef = useRef(null);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    requestAnimationFrame(() => searchButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search, isAuthenticated]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setIsMobileMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Read the current value straight from the input so the latest typed text
    // is never lost even if the store state update has not committed yet.
    const formValue = event.currentTarget?.elements?.search?.value;
    const keyword = (formValue !== undefined ? formValue : searchQuery).trim();
    if (!keyword) return;
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(keyword)}`);
    setSearchQuery("");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="เมนูหลัก"
        className="relative z-50 w-full border-b border-occasion-border/40 bg-surface py-2 sm:py-3 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="OCCASION หน้าแรก"
            className="flex h-12 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 sm:h-16 sm:w-48"
          >
            <img
              src={assets.newlogo}
              alt="OCCASION"
              className="h-auto w-36 max-w-none sm:w-48"
            />
          </Link>

          <div className="flex flex-row gap-2 items-center md:hidden">
            <Link
              to="/cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-secondary transition hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
              aria-label="ตะกร้าสินค้า"
            >
              <img
                src={assets.cartBag}
                alt=""
                aria-hidden="true"
                className="w-6 h-6"
              />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-surface">
                  {totalCartItems > 99 ? "99+" : totalCartItems}
                </span>
              )}
            </Link>
            <button
              id="hamburger-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-secondary transition hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
              aria-label={isMobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div
            id="mobile-menu"
            className={`${isMobileMenuOpen ? "flex" : "hidden"} absolute left-0 top-full w-full border-t border-occasion-border/40 bg-surface p-5 shadow-xl md:static md:flex md:w-auto md:items-center md:justify-end md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <ul className="flex w-full flex-col items-center justify-center gap-2 text-base font-medium md:w-auto md:flex-row md:justify-end md:gap-0 md:divide-x md:divide-occasion-border/45">
              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-4 md:pb-0">
                <button
                  ref={searchButtonRef}
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-transparent text-primary transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:h-11 md:w-11"
                  id="search-button"
                  aria-label="ค้นหาสินค้า"
                  aria-haspopup="dialog"
                  aria-expanded={isSearchOpen}
                  aria-controls="search-modal"
                >
                  <img
                    src={assets.search}
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4"
                  />
                  <span className="text-primary block text-xl md:hidden font-medium">
                    ค้นหา
                  </span>
                </button>
              </li>

              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/products"
                  aria-current={isActive("/products") ? "page" : undefined}
                  className={`relative w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${
                    isActive("/products")
                      ? "font-bold text-accent md:bg-accent/10"
                      : ""
                  }`}
                >
                  สินค้า
                </Link>
              </li>

              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/lookbook"
                  aria-current={isActive("/lookbook") ? "page" : undefined}
                  className={`relative w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/lookbook") ? "font-bold text-accent md:bg-accent/10" : ""}`}
                >
                  ลุกบุ๊ก
                </Link>
              </li>

              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/mix-and-match"
                  aria-current={isActive("/mix-and-match") ? "page" : undefined}
                  className={`relative w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/mix-and-match") ? "font-bold text-accent md:bg-accent/10" : ""}`}
                >
                  มิก & แมตช์
                </Link>
              </li>

              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/article"
                  aria-current={isActive("/article") ? "page" : undefined}
                  className={`relative w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/article") ? "font-bold text-accent md:bg-accent/10" : ""}`}
                >
                  บทความ
                </Link>
              </li>

              {!isAuthenticated ? (
                <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                  <Link
                    to="/login"
                    aria-current={isActive("/login") ? "page" : undefined}
                    className={`relative w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/login") ? "font-bold text-accent md:bg-accent/10" : ""}`}
                  >
                    {"เข้าสู่ระบบ"}
                  </Link>
                </li>
              ) : (
                <ProfileDropdown
                  username={user?.username}
                  membership={user?.membership}
                  isOpen={isProfileOpen}
                  onToggle={() => setIsProfileOpen((isOpen) => !isOpen)}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={handleLogout}
                />
              )}

              <li className="w-full hidden md:w-auto md:flex justify-center items-center md:pl-5 pt-2 md:pt-0">
                <Link
                  to="/cart"
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
                  aria-label="ตะกร้าสินค้า"
                >
                  <img
                    src={assets.cartBag}
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6"
                  />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-surface">
                      {totalCartItems > 99 ? "99+" : totalCartItems}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/*เมื่อ isSearchOpen เป็นจริง แล้วmodal จะทำงาน*/}
      {isSearchOpen && (
        <SearchModal
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onClose={closeSearch}
          onSubmit={handleSearchSubmit}
        />
      )}
    </>
  );
};
