import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";

export const ProfileDropdown = ({ username, isOpen, onToggle, onClose, onLogout }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <li
      ref={containerRef}
      className="relative flex w-full list-none items-center justify-center border-b border-occasion-border/35 pb-2 md:w-auto md:border-b-0 md:px-2 md:pb-0"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="profile-dropdown-menu"
        aria-haspopup="menu"
        className="flex w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 bg-transparent px-3 py-2 text-base font-medium text-primary transition hover:bg-background hover:text-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45 md:w-auto"
      >
        <span>{username || "Admin"}</span>
        <img
          src={assets.down}
          alt=""
          aria-hidden="true"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div id="profile-dropdown-menu" role="menu" className="absolute left-1/2 top-full z-[100] mt-2 h-auto -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0">
          <div className="flex min-h-fit w-48 flex-col gap-2 rounded-2xl border border-occasion-border/55 bg-surface p-3 shadow-2xl">
            <Link
              to="/profile"
              role="menuitem"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg p-2 font-medium text-secondary transition hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
            >
              <img src={assets.userimg} alt="" aria-hidden="true" className="w-5 h-5 shrink-0" />
              <span className="text-sm">Profile</span>
            </Link>
            <hr className="my-1 border-occasion-border/45" />
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent p-2 text-left font-medium text-accent transition hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
            >
              <img src={assets.logout} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="text-base font-semibold text-accent">Logout</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
