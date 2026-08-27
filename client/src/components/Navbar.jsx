import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService.js";
import { assets } from "../assets/assets.js";
import { SearchBar } from "./SearchBar.jsx";
import { useCounterStore } from "../store/useStore.js";
export const Navbar = () => {
  const searchOpen = useCounterStore((state) => state.searchOpen);
  const setSearchOpen = useCounterStore((state) => state.setSearchOpen);
  const searchQuery = useCounterStore((state) => state.searchQuery);
  const setSearchQuery = useCounterStore((state) => state.setSearchQuery);
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    authService.logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    console.log("ระบบกำลังค้นหาสินค้า:", searchQuery);

    setSearchOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="w-full bg-white shadow-sm py-3 relative z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo (ฝั่งซ้าย) */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={assets.newlogo}
              alt="Logo"
              className="w-20 md:w-24 h-auto"
            />
          </Link>

          {/* Mobile Buttons (Cart + Hamburger) */}
          <div className="flex flex-row gap-2 items-center md:hidden">
            <Link
              to="/cart"
              className="inline-flex items-center justify-center p-2 w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              aria-label="Cart"
            >
              <img src={assets.cartBag} alt="Cart" className="w-6 h-6" />
            </Link>

            <button
              id="hamburger-btn"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none transition cursor-pointer"
              aria-label="Toggle Navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

          {/* Menu List Container */}
          <div
            id="mobile-menu"
            className={`${
              isMobileMenuOpen ? "flex" : "hidden"
            } absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 p-6 md:static md:flex md:items-center md:justify-end md:w-auto md:bg-transparent md:shadow-none md:border-0 md:p-0`}
          >
            <ul className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-4 md:gap-0 text-base font-medium w-full md:w-auto md:divide-x md:divide-gray-200">
              {/* Search Button */}
              <li className="w-full md:w-auto pb-3 md:pb-0 md:px-4 border-b border-gray-100 md:border-b-0 flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 md:rounded-full border border-gray-300 items-center flex gap-2 justify-center hover:bg-gray-100 transition border-none rounded-none cursor-pointer"
                  id="search-button"
                >
                  <img src={assets.search} alt="search" className="w-4 h-4" />
                  <span className="text-primary block text-xl md:hidden font-medium">
                    ค้นหา
                  </span>
                </button>
              </li>

              {/* Products Link */}
              <li
                className="w-full md:w-auto pb-3 md:pb-0 md:px-5 border-b border-gray-100 
              md:border-b-0 flex justify-center items-center 
              text-primary hover:underline decoration-secondary underline-offset-4 transition"
              >
                <Link
                  to="/products"
                  className={`whitespace-nowrap ${isActive("/products") ? "font-bold" : ""}`}
                >
                  PRODUCTS
                </Link>
              </li>

              {/* Features Link */}
              <li className="w-full md:w-auto pb-3 md:pb-0 md:px-5 border-b border-gray-100 md:border-b-0 flex justify-center items-center text-primary hover:underline decoration-secondary  underline-offset-4 transition">
                <Link
                  to="/lookbook"
                  className={`whitespace-nowrap ${isActive("/lookbook") ? "font-bold" : ""}`}
                >
                  LOOKBOOKS
                </Link>
              </li>
              <li className="w-full md:w-auto pb-3 md:pb-0 md:px-5 border-b border-gray-100 md:border-b-0 flex justify-center items-center text-primary hover:underline decoration-secondary  underline-offset-4 transition">
                <Link
                  to="/lookbook"
                  className={`whitespace-nowrap ${isActive("/lookbook") ? "font-bold" : ""}`}
                >
                  ARTICLES
                </Link>
              </li>

              {/* Dynamic Auth Section: Sign In หรือ Profile/Dropdown */}
              {!isAuthenticated ? (
                <li className="w-full md:w-auto pb-3 md:pb-0 md:px-5 border-b border-gray-100 md:border-b-0 flex justify-center items-center">
                  <Link
                    to="/login"
                    className="text-primary hover:opacity-80 transition whitespace-nowrap"
                  >
                    SIGN IN
                  </Link>
                </li>
              ) : (
                <li
                  ref={profileRef}
                  className="relative list-none cursor-pointer w-full md:w-auto pb-3 md:pb-0 md:px-5 border-b border-gray-100 md:border-b-0 flex justify-center items-center"
                >
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-primary hover:opacity-80 transition select-none whitespace-nowrap bg-transparent border-none cursor-pointer text-base font-medium"
                  >
                    <span>{user?.username || "Admin"}</span>
                    <img
                      src={assets.down}
                      alt="down-btn"
                      className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div
                      id="dropdown-menu-btn"
                      className="absolute top-full right-0 z-[100] mt-2 h-auto"
                    >
                      <div className="bg-white w-48 min-h-fit rounded-2xl p-4 shadow-2xl border border-gray-100 flex flex-col gap-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-gray-700 font-medium"
                        >
                          <img
                            src={assets.userimg}
                            alt="profile"
                            className="w-5 h-5 shrink-0"
                          />
                          <span className="text-sm">Profile</span>
                        </Link>

                        <hr className="border-gray-200 my-1" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition text-red-600 font-medium w-full text-left bg-transparent border-none cursor-pointer"
                        >
                          <img
                            src="./assets/icon/logout.png"
                            alt="logout"
                            className="w-5 h-5 shrink-0"
                          />
                          <span className="text-md text-red-600 font-semibold">
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )}

              {/* Cart (Desktop Only) */}
              <li className="w-full hidden md:w-auto md:flex justify-center items-center md:pl-5 pt-2 md:pt-0">
                <Link
                  to="/cart"
                  className="hover:opacity-80 transition flex items-center"
                >
                  <img src={assets.cartBag} alt="Cart" className="w-6 h-6" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <SearchBar
          handleSearchSubmit={handleSearchSubmit}
          setSearchOpen={setSearchOpen}
          setSearchQuery={setSearchQuery}
          searchQuery={searchQuery}
        />
      )}
    </>
  );
};
