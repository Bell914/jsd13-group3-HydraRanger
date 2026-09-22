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

  const fullName = product.nameTh || product.name || product.title || "";
  const englishName =
    String(fullName).replace(/^[^a-zA-Z0-9]+/, "").trim() || fullName;

  const targetUrl =
    product.link ||
    (product.id
      ? String(product.id).toUpperCase().startsWith("LOOK")
        ? `/lookbook/${product.id}`
        : `/products/${product.id}`
      : product._id
        ? `/products/${product._id}`
        : "/products");

  return (
    <div
      key={index}
      className="group relative aspect-[3/4] w-full max-w-sm shrink-0 overflow-hidden rounded-xl bg-[#0046a7] shadow-md transition-shadow duration-300 group-hover:shadow-xl"
    >
      <img
        src={imgUrl}
        alt={product.nameTh || product.name || product.title}
        loading="lazy"
        decoding="async"
        className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <Link
        to={targetUrl}
        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="rounded-full bg-white px-6 py-2 font-bold text-gray-900 shadow-lg transition-colors hover:bg-gray-100">
          ดูสินค้า
        </span>
      </Link>
      <span className="absolute top-0 left-1 z-10">
        <img src={assets.newtag} alt="new-icon" className="h-12 w-12 object-contain" />
      </span>
      <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg pr-4 z-10">
        <h4 className="text-2xl sm:text-3xl line-clamp-2">{englishName}</h4>
      </div>
    </div>
  );
};
