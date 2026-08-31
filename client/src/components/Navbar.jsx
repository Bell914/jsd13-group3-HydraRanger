import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { assets } from "../assets/assets.js";
import { useCounterStore } from "../store/useStore.js";
import { ProfileDropdown } from "./ProfileDropdown.jsx";
import { SearchModal } from "./SearchModal.jsx";

export const Navbar = () => {
  const searchQuery = useCounterStore((state) => state.searchQuery);
  const setSearchQuery = useCounterStore((state) => state.setSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
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
    authService.logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        ref={navRef}
        aria-label="เมนูหลัก"
        className="relative z-50 w-full border-b border-occasion-border/40 bg-surface py-3 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="OCCASION หน้าแรก"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
          >
            <img
              src={assets.newlogo}
              alt="OCCASION"
              className="h-auto w-20 md:w-24"
            />
          </Link>

          <div className="flex flex-row gap-2 items-center md:hidden">
            <Link
              to="/cart"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-secondary transition hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
              aria-label="ตะกร้าสินค้า"
            >
              <img
                src={assets.cartBag}
                alt=""
                aria-hidden="true"
                className="w-6 h-6"
              />
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
              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-3 md:w-auto md:border-b-0 md:px-4 md:pb-0">
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
                  className={`w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/products") ? "bg-accent/10 font-bold text-accent" : ""}`}
                >
                  PRODUCTS
                </Link>
              </li>
              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/lookbook"
                  aria-current={isActive("/lookbook") ? "page" : undefined}
                  className={`w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/lookbook") ? "bg-accent/10 font-bold text-accent" : ""}`}
                >
                  FEATURES
                </Link>
              </li>
              <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                <Link
                  to="/article"
                  aria-current={isActive("/article") ? "page" : undefined}
                  className={`w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/lookbook") ? "bg-accent/10 font-bold text-accent" : ""}`}
                >
                  ARTICLE
                </Link>
              </li>

              {!isAuthenticated ? (
                <li className="flex w-full items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0">
                  <Link
                    to="/login"
                    aria-current={isActive("/login") ? "page" : undefined}
                    className={`w-full rounded-lg px-3 py-2 text-center text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto ${isActive("/login") ? "bg-accent/10 font-bold text-accent" : ""}`}
                  >
                    SIGN IN
                  </Link>
                </li>
              ) : (
                <ProfileDropdown
                  username={user?.username}
                  isOpen={isProfileOpen}
                  onToggle={() => setIsProfileOpen((isOpen) => !isOpen)}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={handleLogout}
                />
              )}

              <li className="w-full hidden md:w-auto md:flex justify-center items-center md:pl-5 pt-2 md:pt-0">
                <Link
                  to="/cart"
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
                  aria-label="ตะกร้าสินค้า"
                >
                  <img
                    src={assets.cartBag}
                    alt=""
                    aria-hidden="true"
                    className="w-6 h-6"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

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
