import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Zap,
  Server,
  Code,
} from "lucide-react";
import { assets } from "../assets/assets.js";
import { Button, Card } from "../components/index.js";
import { specialProducts } from "../assets/assets.js";
export const HomePage = () => {
  return (
    <div className="w-full bg-background font-sans">
      {/* Hero Section */}
      <section className="relative" id="new">
        <img
          src={assets.bghero}
          alt="Two models wearing black and white minimal tailoring in a concrete studio"
          width="1920"
          height="1080"
          className="h-[78vh] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-foreground/35">
          <div className="absolute w-full max-w-7xl px-6 pb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white">
              occasion mix and match style by ai
            </p>
            <h1 className="animate-gradient mt-4 max-w-3xl font-display text-5xl uppercase leading-[1.02] tracking-[0.02em] text-background md:text-7xl">
              CREATE YOUR LOOK SMOOTH
            </h1>
            <p className="mt-8 text-[11px] uppercase tracking-[0.02em] text-white">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              <br />
              Rerum iure eaque voluptatum voluptas eius illum.
            </p>
            <a
              href="./Product_Page.html"
              className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-foreground text-primary transition-opacity hover:opacity-85"
            >
              OUR PRODUCT
            </a>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section id="main" className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        {/* Recommend Section Header */}
        <div className="my-6 text-center text-primary sm:text-center md:text-left lg:text-left">
          <h3 className="text-center text-2xl font-bold md:text-left">
            RECOMMEND PRODUCT
          </h3>
          <p className="text-center font-semibold text-xl text-gray-700 md:text-left">
            สินค้าแนะนำเลือกช็อปตามใจ
          </p>
        </div>

        {/* Card Grid */}
        <div className="my-8 grid grid-cols-1 gap-6 px-4 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative aspect-[3/4] mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
            <a
              href="Product_Page.html?category=tops"
              className="block h-full w-full"
            >
              <img
                src="/collection-2026/lookbook/look-01-city-museum.png"
                alt="เสื้อ"
                className="h-full w-full cursor-pointer object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
                <h4 className="text-3xl">เสื้อ</h4>
                <h6 className="text-sm font-normal opacity-90">
                  สำรวจหมวดหมู่
                </h6>
              </div>
            </a>
          </div>

          {/* Card 2 */}
          <div className="group relative aspect-[3/4] mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
            <a
              href="Product_Page.html?category=bottoms"
              className="block h-full w-full"
            >
              <img
                src="/collection-2026/all-images/bottom-01-black.png"
                alt="กางเกง"
                className="h-full w-full cursor-pointer object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
                <h4 className="text-3xl">กางเกง</h4>
                <h6 className="text-sm font-normal opacity-90">
                  สำรวจหมวดหมู่
                </h6>
              </div>
            </a>
          </div>

          {/* Card 3 */}
          <div className="group relative aspect-[3/4] mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
            <a
              href="Product_Page.html?category=bottoms"
              className="block h-full w-full"
            >
              <img
                src="/collection-2026/lookbook/look-02-weekend-market.png"
                alt="กระโปรง"
                className="h-full w-full cursor-pointer object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
                <h4 className="text-3xl">กระโปรง</h4>
                <h6 className="text-sm font-normal opacity-90">
                  สำรวจหมวดหมู่
                </h6>
              </div>
            </a>
          </div>
        </div>

        {/* Mix and Match Section */}
        <div className="my-12 flex flex-col justify-between gap-8 rounded-2xl bg-secondary p-6 sm:p-10 lg:flex-row">
          <div className="flex flex-col p-9 lg:w-2/3">
            <div className="mb-6 text-white">
              <p className="text-sm font-bold tracking-wider opacity-80">
                MIX AND MATCH
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                หมดปัญหาซื้อเสื้อไปแล้วไม่รู้จะแมตช์กับกางเกงตัวไหน!
              </h2>
              <p className="mt-2 text-white/90">
                ทดลองจับคู่ลุคโปรดของคุณในระบบจำลองห้องแต่งตัวก่อนสั่งซื้อ
              </p>
            </div>
            <ol className="flex flex-col gap-4 text-white">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  1
                </span>
                <span>
                  เลือกชิ้นส่วนเสื้อผ้า เลือกเสื้อ ท่อนล่าง
                  และเครื่องประดับที่คุณชอบ
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  2
                </span>
                <span>
                  ดูพรีวิวบนหุ่นจำลอง ระบบจะจัดเรียงชุดให้เห็นสไตล์โดยรวมทันที
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  3
                </span>
                <span>
                  เพิ่มลงตะกร้าพร้อมกันทั้งเซ็ต รับส่วนลดพิเศษทันที 10%
                  เมื่อซื้อยกเซ็ต
                </span>
              </li>
            </ol>
          </div>

          {/* Dropzone */}
          <div className="flex flex-col justify-center gap-4  sm:flex-row lg:w-1/3 lg:flex-col">
            <div
              className="flex cursor-pointer items-center justify-center 
             lg:bg-gray-600 rounded-xl border-2 border-dashed
              border-white/40 bg-secondary/80 p-12 transition hover:bg-secondary"
            >
              <div className="flex items-center gap-3 text-white">
                <img
                  src={assets.camera}
                  alt="icon"
                  className="h-6 w-6 object-contain"
                />
                <span className="font-medium">ลากรูปมาที่นี่</span>
              </div>
            </div>
            <div
              className="flex cursor-pointer items-center justify-center  
             lg:bg-gray-600  rounded-xl border-2 border-dashed
              border-white/40 bg-secondary/80 p-12 transition hover:bg-secondary"
            >
              <div className="flex items-center gap-3 text-white">
                <img
                  src={assets.camera}
                  alt="icon"
                  className="h-6 w-6 object-contain"
                />
                <span className="font-medium">ลากรูปมาที่นี่</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lookbook Section */}
        <div>
          <div className="py-5 text-center text-primary md:text-left">
            <h2 className="text-2xl font-bold">RECOMMEND LOOKBOOK</h2>
            <p className="font-semibold text-xl text-gray-700">
              Mix and Match ลุคสุดพิเศษที่ได้รับความนิยม
            </p>
          </div>
          <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
              <img
                src="/collection-2026/lookbook/look-05-seaside-walk.png"
                alt="เสื้อ"
                className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/10 px-3 py-1 font-bold text-white drop-shadow-lg backdrop-blur-md">
                <h4 className="bg-gradient-to-r from-white via-white to-gray-200 bg-clip-text text-3xl font-bold uppercase tracking-tight text-transparent [text-shadow:0_4px_8px_rgba(0,0,0,0.3),_0_2px_4px_rgba(255,255,255,0.4)]">
                  เสื้อ
                </h4>
                <h6 className="text-sm font-normal">สำรวจหมวดหมู่</h6>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
              <img
                src="/collection-2026/lookbook/look-06-gallery-date.png"
                alt="กางเกง"
                className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/10 px-3 py-1 font-bold drop-shadow-lg backdrop-blur-md">
                <h4 className="bg-gradient-to-r from-white via-white to-gray-200 bg-clip-text text-3xl font-bold uppercase tracking-tight text-transparent [text-shadow:0_4px_8px_rgba(0,0,0,0.3),_0_2px_4px_rgba(255,255,255,0.4)]">
                  กางเกง
                </h4>
                <h6 className="text-sm text-gray-200 opacity-90">
                  สำรวจหมวดหมู่
                </h6>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-xl shadow-md">
              <img
                src="/collection-2026/lookbook/look-08-park-picnic.png"
                alt="กระโปรง"
                className="h-auto w-full rounded-xl object-cover transition duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/10 px-3 py-1 font-bold text-white drop-shadow-lg backdrop-blur-md">
                <h4 className="bg-gradient-to-r from-white via-white to-gray-200 bg-clip-text text-3xl font-bold uppercase tracking-tight text-transparent [text-shadow:0_4px_8px_rgba(0,0,0,0.3),_0_2px_4px_rgba(255,255,255,0.4)]">
                  กระโปรง
                </h4>
                <h6 className="text-sm font-normal opacity-90">
                  สำรวจหมวดหมู่
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Special Product Marquee Section */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-primary">Special Product</h2>
          <p className="text-xl text-primary">
            สินค้าพิเศษเฉพาะช่วงนี้เท่านั้น
          </p>
        </div>

        <div className="relative my-8 h-auto w-full overflow-hidden rounded-2xl bg-background px-4 py-8 font-bold text-lg text-white sm:px-6 lg:px-8">
          <div className="animate-marquee flex w-max gap-4 whitespace-nowrap">
            {specialProducts.map((product, idx) => (
              <div
                key={idx}
                className="group relative shrink-0 overflow-hidden rounded-xl cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-[400px] w-96 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <a
                  href={product.link}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <span className="rounded-full bg-white px-6 py-2 font-bold text-gray-900 shadow-lg transition-colors hover:bg-gray-100">
                    ดูสินค้า
                  </span>
                </a>
                <span className="absolute top-0 left-1">
                  <img
                    src={assets.newtag}
                    alt="new-icon"
                    className="h-12 w-13"
                  />
                </span>
                <div className="absolute bottom-4 left-4 font-bold text-white drop-shadow-lg">
                  <h4 className="text-3xl">{product.title}</h4>
                  <h6 className="text-sm font-normal opacity-90">
                    สำรวจหมวดหมู่
                  </h6>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="aura">
          <button className="btn">button with aura</button>
        </div>
        <button class="btn btn-secondary shadow-lg shadow-secondary/50">
          Secondary Aura
        </button>
        <button class="btn btn-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          Aura Button
        </button>
        <div className="aura aura-rainbow">
          <div className="card bg-base-100">
            <div className="card-body">
              <p>This card has rainbow aura</p>
            </div>
          </div>
        </div>

        <button class="btn btn-neutral btn-aura">Hover Me</button>
        {/* Article Section */}
        <div className="pt-5 text-center md:text-left">
          <h2 className="text-2xl font-bold text-primary">Article</h2>
          <p className="text-xl text-primary">อ่านบทความพิเศษช่วงนี้เท่านั้น</p>
        </div>
        <div className="mx-auto max-w-7xl py-5">
          <div
            id="article-grid"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* DOM Render บทความใน React ผ่าน state หรือ props */}
          </div>
        </div>
      </section>
    </div>
  );
};
