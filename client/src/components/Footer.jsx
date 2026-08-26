import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer id="Footer" className="bg-secondary text-white">
      <div className="max-w-6xl w-full mx-auto px-4 py-8">
        {/* Banner สีฟ้า */}
        <div className="bg-primary flex flex-col sm:flex-row justify-between items-center p-6 sm:p-8 rounded-xl shadow-md gap-4">
          <p className="text-white font-medium text-base sm:text-lg text-center sm:text-left">
            Become a member and get 10% off for first purchase
          </p>
          <button
            type="button"
            className="bg-white text-primary font-bold px-6 py-2.5 rounded-md hover:bg-gray-100 transition whitespace-nowrap shadow cursor-pointer border-none"
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
                  className="hover:underline transition"
                >
                  Tops
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=bottoms"
                  className="hover:underline transition"
                >
                  Bottoms
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="hover:underline transition">
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
                  className="hover:underline transition"
                >
                  Customer Service
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="hover:underline transition"
                >
                  Terms & Condition
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:underline transition"
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
                <Link to="/register" className="hover:underline transition">
                  Become A Member
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:underline transition">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="hover:underline transition">
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
                  className="inline-flex items-center gap-2 hover:opacity-80 transition"
                >
                  <img
                    src="./assets/icon/facebook.png"
                    alt="facebook"
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
                  className="inline-flex items-center gap-2 hover:opacity-80 transition"
                >
                  <img
                    src="./assets/icon/instagram.png"
                    alt="instagram"
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
                  className="inline-flex items-center gap-2 hover:opacity-80 transition"
                >
                  <img
                    src="./assets/icon/line.png"
                    alt="line"
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
                  className="inline-flex items-center gap-2 hover:opacity-80 transition"
                >
                  <img
                    src="./assets/icon/tiktok.png"
                    alt="tiktok"
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
