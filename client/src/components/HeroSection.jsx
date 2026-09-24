import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const HeroSection = () => {
  const heroProducts = [
    { id: "top-001", image: "/collection-2026/products/top-01-off-white.png", name: "เสื้อยืดทรง Relaxed สี Off White" },
    { id: "top-002", image: "/collection-2026/products/top-02-white.png", name: "เสื้อเชิ้ตทรง Oversized สี White" },
    { id: "top-003", image: "/collection-2026/products/top-03-sand.png", name: "เสื้อยืดทรง Oversized สี Sand" },
    { id: "top-004", image: "/collection-2026/products/top-04-olive.png", name: "เสื้อเชิ้ตทรง Utility สี Olive" },
    { id: "top-005", image: "/collection-2026/products/top-05-navy-stripe.png", name: "เสื้อแขนยาวลายทางสี Navy" },
    { id: "bottom-001", image: "/collection-2026/products/bottom-01-indigo.png", name: "กางเกงยีนส์ทรง Relaxed สี Indigo" },
  ];

  return (
    <section className="hero-poster" id="new">
      <h1 className="hero-poster__wordmark">OCCASION</h1>

      <div className="hero-product-reel" aria-label="ภาพเคลื่อนไหวคอลเล็กชันสินค้า">
        <div className="hero-product-reel__track">
          {[...heroProducts, ...heroProducts].map((product, index) => (
            <Link key={`${product.id}-${index}`} to={`/products/${product.id}`} className="hero-product-reel__link" aria-label={`ดูสินค้า: ${product.name}`}>
              <img className="hero-product-reel__item" src={product.image} alt="" />
            </Link>
          ))}
        </div>
      </div>

      <div className="hero-poster__details">
        <div className="hero-poster__tags" aria-label="คุณสมบัติสินค้า">
          <span>Everyday essential</span>
          <span>Premium cotton</span>
          <span>Unisex fit</span>
        </div>
        <p>
          A considered collection of versatile pieces, made to move with every
          moment and every version of you.
        </p>
      </div>

      <div className="hero-poster__cta">
        <Link to="/products">Explore the edit <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
      <div className="hero-poster__offer">JOIN THE OCCASION LIST · 10% OFF YOUR FIRST ORDER</div>
      <div className="hero-poster__corner-note">MADE FOR YOUR MOMENT</div>
    </section>
  );
};
