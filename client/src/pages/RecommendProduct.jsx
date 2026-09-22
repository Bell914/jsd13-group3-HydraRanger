import React from "react";
import { Link } from "react-router-dom";
import { normalizeImageUrl } from "../utils/imageUtils.js";

export const RecommendProduct = ({ product, index }) => {
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
      : "/lookbook");

  return (
    <div className="group relative aspect-[3/4] mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
      <Link to={targetUrl} className="block h-full w-full">
        <img
          src={imgUrl}
          alt={product.title || product.nameTh || product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full cursor-pointer object-cover transition duration-300 ease-in-out group-hover:scale-105"
        />
        <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
          <h4 className="text-3xl">
            {product.title || product.nameTh || product.name}
          </h4>
          <h6 className="text-sm font-normal opacity-90">ดูลุคนี้ &rarr;</h6>
        </div>
      </Link>
    </div>
  );
};
