import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/HeroSection.jsx";
import { RecommendProduct } from "./RecommendProduct.jsx";
import { TextHomepage } from "../components/TextHomepage.jsx";
import { SpecialProducts } from "../components/SpecialProducts.jsx";
import { getProducts } from "../services/productService.js";
import { getLookbooks } from "../services/lookbookService.js";
import { getArticles } from "../services/articleService.js";

export const HomePage = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLooks, setRecommendedLooks] = useState([]);
  const [recommendedArticles, setRecommendedArticles] = useState([]);

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((products) => {
        if (!mounted) return;
        setRecommendedProducts(Array.isArray(products) ? products : []);
      })
      .catch(() => {
        if (mounted) setRecommendedProducts([]);
      });
    getLookbooks()
      .then((lookbooks) => {
        if (!mounted) return;
        setRecommendedLooks(Array.isArray(lookbooks) ? lookbooks : []);
      })
      .catch(() => {
        if (mounted) setRecommendedLooks([]);
      });
    getArticles({ limit: 3 })
      .then(({ articles }) => {
        if (!mounted) return;
        setRecommendedArticles(Array.isArray(articles) ? articles : []);
      })
      .catch(() => {
        if (mounted) setRecommendedArticles([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const recProducts = recommendedProducts.slice(0, 3);
  const teamMembers = [
    { name: "Pathsharasakon", nickname: "Nae / เน่", character: "Chopper", portraitImage: "/team/member-1.png", characterImage: "/team/chopper.png" },
    { name: "Tipkanya", nickname: "Luknok / ลูกนก", character: "Usopp", portraitImage: "/team/member-2.png", characterImage: "/team/usopp.png" },
    { name: "Puttipong", nickname: "Mos / มอส", character: "Ace", portraitImage: "/team/member-4.png", characterImage: "/team/ace.png" },
    { name: "Ittikorn", nickname: "BM / บีเอ็ม", character: "Zoro", portraitImage: "/team/member-3.png", characterImage: "/team/zoro.png" },
    { name: "Sitthan", nickname: "Bird / เบิร์ด", character: "One Piece", portraitImage: "/team/member-5.png", characterImage: "/team/skull.png" },
  ];

  return (
    <div className="homepage flex min-w-0 flex-col gap-6 pb-4 sm:gap-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Section */}
      <section id="main" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="body-reference-section" aria-labelledby="recommend-products-title">
          <TextHomepage
            textheader={"สินค้าแนะนำเลือกช็อปตามใจ"}
          />
          <div className="product-click-grid">
            {recProducts.map((el, index) => (
              <SpecialProducts
                key={el._id || el.id || `rec-card-${index}`}
                product={el}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Lookbook Section */}
        <section className="body-reference-section lookbook-section" aria-labelledby="recommend-lookbook-title">
          <TextHomepage
            textheader={"ลุคสุดพิเศษที่ได้รับความนิยม"}
          />
          <div className="product-click-grid product-click-grid--lookbook">
            {recommendedLooks.slice(1, 4).map((el, index) => (
              <RecommendProduct
                key={el._id || el.id || `lookbook-${index}`}
                product={el}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Special Product Marquee Section */}
        <section className="body-reference-section" aria-labelledby="special-products-title">
          <TextHomepage
            textheader={"สินค้าพิเศษเฉพาะช่วงนี้เท่านั้น"}
          />
          <div className="product-click-grid">
            {recommendedProducts.slice(0, 3).map((product, idx) => (
              <SpecialProducts
                key={product._id || product.id || `special-card-${idx}`}
                product={product}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* Article Section */}
        <TextHomepage
          textheader={"อ่านบทความพิเศษช่วงนี้เท่านั้น"}
          className="article-section-heading"
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
{recommendedArticles.map((article) => (
              <div
                key={article.id || article.title}
                className="card bg-base-100 flex flex-col justify-between w-full shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <figure className="w-full overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </figure>
                <div className="card-body flex flex-col justify-between flex-grow p-4 sm:p-6">
                  <div>
<div className="badge badge-secondary text-xs mb-2">
                      {article.category}
                    </div>
                    <h2 className="card-title text-lg text-[#263639] sm:text-xl line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-[#526164] sm:text-base mt-2 line-clamp-3">
                      {article.excerpt || article.content || ""}
                    </p>
                  </div>

                  <div className="card-actions justify-end mt-4 pt-2">
                    <Link
                      to={`/article/${article.id}`}
                      state={{ from: "/" }}
                      className="btn btn-sm sm:btn-md w-full bg-[#263639] text-white hover:bg-[#987b76] md:w-auto"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="team-section" aria-labelledby="team-title">
          <div className="team-section__heading">
            <h2 id="team-title">Meet the Crew</h2>
            <span>Hover each card to reveal their character.</span>
          </div>
          <div className="team-card-grid">
            {teamMembers.map((member) => (
              <article className="team-flip-card" key={member.name} tabIndex="0" aria-label={`${member.name}, ${member.nickname}, character ${member.character}`}>
                <div className="team-flip-card__inner">
                  <div className={`team-flip-card__face team-flip-card__front ${member.character === "Chopper" ? "team-flip-card__front--chopper" : ""} ${member.character === "Ace" ? "team-flip-card__front--ace" : ""} ${member.character === "Zoro" ? "team-flip-card__front--zoro" : ""} ${member.character === "One Piece" ? "team-flip-card__front--skull" : ""}`}>
                    <img src={member.characterImage} alt={`${member.character} character`} />
                  </div>
                  <div className="team-flip-card__face team-flip-card__back">
                    <img className="team-flip-card__portrait" src={member.portraitImage} alt="" />
                    <div className="team-flip-card__label"><strong>{member.nickname}</strong><span>{member.name}</span></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};
