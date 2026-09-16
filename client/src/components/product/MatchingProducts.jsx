import React from "react";
import { Link } from "react-router-dom";
import { normalizeImageUrl } from "../../utils/imageUtils.js";

export const MatchingProducts = ({ products = [] }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="my-14">
      <h2 className="text-2xl font-black text-primary mb-6">
        สินค้าที่เข้ากันได้ดี
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((match, idx) => {
          const imgUrl = normalizeImageUrl(match.imageUrl);
          const minPrice = match.variants?.[0]?.price ?? 490;
          return (
            <Link
              key={match._id || idx}
              to={`/products/${match._id || match.productId}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl aspect-[3/4] p-3"
            >
              <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-white/95 p-3 flex items-center justify-center">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={match.name}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-extrabold text-[#0046a7]">
                    Product{idx + 1}
                  </span>
                )}
                <span className="absolute top-2 left-2 rounded-md bg-[#0046a7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {match.category || "item"}
                </span>
              </div>
              <div className="pt-3 pb-1 flex items-center justify-between text-white">
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-extrabold tracking-wide text-white">
                    {match.category === "tops" ? "เสื้อ" : "กางเกง"}
                  </span>
                  <span className="text-[11px] text-white/80 line-clamp-1 max-w-[130px]">
                    {match.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-amber-200">
                    ฿{minPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MatchingProducts;
