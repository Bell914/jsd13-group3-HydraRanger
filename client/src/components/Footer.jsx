import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

export const Footer = () => {
  return (
    <footer id="Footer" className="bg-primary text-white">
      <div className="max-w-6xl w-full mx-auto px-4 py-8">
        {/* Banner สีฟ้า */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-secondary p-6 shadow-md sm:flex-row sm:p-8">
          <p className="text-white font-medium text-base sm:text-lg text-center sm:text-left">
            Become a member and get 10% off for first purchase
          </p>
          <button
            type="button"
            className="min-h-11 cursor-pointer whitespace-nowrap rounded-xl border border-white bg-surface px-6 py-2.5 font-bold text-primary shadow transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          >
            Subscribe
          </button>
        </div>

        {/* ส่วน Footer Links และ Social */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-10">
          {/* SHOP */}
          <div>
            <h4 className="font-bold text-lg mb-4">SHOP</h4>
            <ul className="space-y-2 text-sm text-white/90 list-none p-0 m-0">
              <li>
                <Link
                  to="/products?category=tops"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=bottoms"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link
                  to="/lookbook"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  LookBooks
                </Link>
              </li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="font-bold text-lg mb-4">HELP</h4>
            <ul className="space-y-2 text-sm text-white/90 list-none p-0 m-0">
              <li>
                <Link
                  to="/customer-service"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Customer Service
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Terms & Condition
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* USER */}
          <div>
            <h4 className="font-bold text-lg mb-4">USER</h4>
            <ul className="space-y-2 text-sm text-white/90 list-none p-0 m-0">
              <li>
                <Link
                  to="/register"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  Become A Member
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/lookbook"
                  className="rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  My Lookbooks
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h4 className="font-bold text-lg mb-4">Connect with OCCASION</h4>
            <ul className="flex flex-col space-y-3 text-sm text-white/90 list-none p-0 m-0">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  <img
                    src={assets.facebook}
                    alt="facebook"
                    aria-hidden="true"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  <img
                    src={assets.instagram}
                    alt="instagram"
                    aria-hidden="true"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  <img
                    src={assets.lineOfficial}
                    alt="line"
                    aria-hidden="true"
                    className="w-5 h-5 object-contain"
                  />
                  <span>Line Official</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm transition hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/80"
                >
                  <img
                    src={assets.tiktok}
                    alt="tiktok"
                    aria-hidden="true"
                    className="w-5 h-5 object-contain"
                  />
                  <span>TikTok</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center text-xs text-white/70">
          &copy; 2026 OCCASION. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
