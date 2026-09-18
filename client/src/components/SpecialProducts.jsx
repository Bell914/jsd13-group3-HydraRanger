import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export const SpecialProducts = ({ product, index }) => {
  const rawImg =
    product.image ||
    product.items?.[0]?.image ||
    product.imageUrl ||
    product.images?.[0]?.image_url ||
    product.variants?.[0]?.imageUrl ||
    "";
  const imgUrl = normalizeImageUrl(rawImg) || rawImg;

  const targetUrl =
    product.link ||
    (product.id
      ? String(product.id).toUpperCase().startsWith("LOOK")
        ? `/lookbook/${product.id}`
        : `/products/${product.id}`
      : "/products");

  return (
    <div
      key={index}
      className="group relative shrink-0 overflow-hidden rounded-xl cursor-pointer w-full max-w-sm mx-auto"
    >
      <img
        src={imgUrl}
        alt={product.nameTh || product.name || product.title}
        className="h-[400px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <Link
        to={targetUrl}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="rounded-full bg-white px-6 py-2 font-bold text-gray-900 shadow-lg transition-colors hover:bg-gray-100">
          ดูสินค้า
        </span>
      </Link>
      <span className="absolute top-0 left-1">
        <img src={assets.newtag} alt="new-icon" className="h-12 w-12 object-contain" />
      </span>
      <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg pr-4">
        <h4 className="text-2xl sm:text-3xl line-clamp-1">
          {product.nameTh || product.name}
        </h4>
        <h6 className="text-sm font-normal opacity-90">สำรวจหมวดหมู่</h6>
      </div>
    </div>
  );
};
