import React from "react";
import lookData from "../data/look-data.json";
import { assets, fashionNews } from "../assets/assets.js";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/HeroSection.jsx";
import { RecommendProduct } from "./RecommendProduct.jsx";
import { TextHomepage } from "../components/TextHomepage.jsx";
import { SpecialProducts } from "../components/SpecialProducts.jsx";
import MixAndMatchSection from "../components/MixAndMatchSection.jsx";
import { normalizeImageUrl } from "../utils/imageUtils.js";

const looksData = lookData?.looks || lookData?.default?.looks || [];
const looks = looksData.map((look) => ({
  ...look,
  image: normalizeImageUrl(look?.image),
  items: Array.isArray(look?.items)
    ? look.items.map((item) => ({
        ...item,
        image: normalizeImageUrl(item?.image),
      }))
    : [],
}));

export const HomePage = () => {
  return (
    <div className="flex min-w-0 flex-col gap-12 sm:gap-16 ">
      {/* Hero Section */}
      <HeroSection bgimage={assets.bghero} />

      {/* Main Section */}
      <section id="main" className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        {/* Recommend Section Header */}
        <TextHomepage
          textheader={"RECOMMEND PRODUCT"}
          textdisc={"สินค้าแนะนำเลือกช็อปตามใจ"}
        />

        {/* Card Grid */}
        <div className="my-8 grid grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {looks.slice(1, 4).map((el, index) => (
            <SpecialProducts
              key={el.id || `rec-card-${index}`}
              product={el}
              index={index}
            />
          ))}
        </div>

        {/* Mix and Match Section */}
        <MixAndMatchSection assets={assets} />

        {/* Lookbook Section */}
        <div>
          <TextHomepage
            textheader={"RECOMMEND LOOKBOOK"}
            textdisc={"Mix and Match ลุคสุดพิเศษที่ได้รับความนิยม"}
          />

          <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            {looks.slice(1, 4).map((el, index) => (
              <RecommendProduct
                key={el.id || `lookbook-${index}`}
                product={el}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Special Product Marquee Section */}
        <TextHomepage
          textheader={"Special Product"}
          textdisc={" สินค้าพิเศษเฉพาะช่วงนี้เท่านั้น"}
        />

        <div className="relative my-8 h-auto w-full overflow-hidden rounded-2xl bg-background px-4 py-8 font-bold text-lg text-white sm:px-6 lg:px-8">
          <div className="animate-marquee flex w-max gap-4 whitespace-nowrap">
            {looks.map((product, idx) => (
              <SpecialProducts
                key={product.id ? `marquee-${product.id}` : `marquee-${idx}`}
                product={product}
                index={idx}
              />
            ))}
          </div>
        </div>

        {/* Article Section */}
        <TextHomepage
          textheader={"Article"}
          textdisc={"อ่านบทความพิเศษช่วงนี้เท่านั้น"}
        />

        {/* Article Hero: video banner */}
        <section className="relative mb-8 overflow-hidden rounded-2xl">
          <video
            src="/collection-2026/hero-media/Friends_exploring_fashion_outfit…_20260916145405.mp4"
            className="h-[40vh] w-full object-cover md:h-[50vh]"
            autoPlay
            muted
            playsInline
            loop
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/35 to-transparent p-6 md:p-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white drop-shadow-md">
                occasion mix and match style by ai
              </p>
              <h1 className="mt-2 font-display text-4xl uppercase leading-[1.05] tracking-[0.02em] text-white drop-shadow-lg md:text-6xl">
                FASHION
                <br />
                JOURNAL
              </h1>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl py-5 px-4">
          <div
            id="article-grid"
            className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {fashionNews.slice(1, 4).map((article) => (
              <div
                key={article.id}
                className="card bg-base-100 flex flex-col justify-between w-full shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <figure className="w-full overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </figure>
                <div className="card-body flex flex-col justify-between flex-grow p-4 sm:p-6">
                  <div>
                    <h2 className="card-title text-lg sm:text-xl line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm sm:text-base text-base-content/70 mt-2 line-clamp-3">
                      {article.description}
                    </p>
                  </div>

                  <div className="card-actions justify-end mt-4 pt-2">
                    <Link
                      to={`/article/${article.id}`}
                      className="btn btn-primary btn-sm sm:btn-md w-full md:w-auto"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
