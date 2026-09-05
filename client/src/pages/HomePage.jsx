import React from "react";
import { assets, fashionNews, specialProducts } from "../assets/assets.js";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/HeroSection.jsx";
import { RecommendProduct } from "./RecommendProduct.jsx";
import { TextHomepage } from "../components/TextHomepage.jsx";
import { SpecialProducts } from "../components/SpecialProducts.jsx";
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
          {specialProducts.slice(1, 4).map((el, index) => (
            <RecommendProduct product={el} index={index} />
          ))}
        </div>

        {/* Mix and Match Section */}
        <div className="my-12 flex flex-col justify-between gap-8 rounded-2xl bg-accent p-6 sm:p-10 lg:flex-row">
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
          <div className="flex flex-col justify-center gap-4 sm:flex-row lg:w-1/3 lg:flex-col">
            <div className="flex cursor-pointer items-center justify-center lg:bg-gray-600 rounded-xl border-2 border-dashed border-white/40 bg-secondary/80 p-12 transition hover:bg-secondary">
              <div className="flex items-center gap-3 text-white">
                <img
                  src={assets.camera}
                  alt="icon"
                  className="h-6 w-6 object-contain"
                />
                <span className="font-medium">ลากรูปมาที่นี่</span>
              </div>
            </div>
            <div className="flex cursor-pointer items-center justify-center lg:bg-gray-600 rounded-xl border-2 border-dashed border-white/40 bg-secondary/80 p-12 transition hover:bg-secondary">
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
          <TextHomepage
            textheader={"RECOMMEND LOOKBOOK"}
            textdisc={"Mix and Match ลุคสุดพิเศษที่ได้รับความนิยม"}
          />

          <div className="my-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            {fashionNews.slice(1, 4).map((el, index) => (
              <RecommendProduct product={el} index={index} />
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
            {specialProducts.map((product, idx) => (
              <SpecialProducts product={product} index={idx} />
            ))}
          </div>
        </div>

        {/* Article Section */}
        <TextHomepage
          textheader={"Article"}
          textdisc={"อ่านบทความพิเศษช่วงนี้เท่านั้น"}
        />

        <div className="mx-auto max-w-7xl py-5 px-4">
          <div
            id="article-grid"
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {fashionNews.slice(1, 4).map((article) => (
              /* แปลง class เป็น className และเปลี่ยน w-96 เป็น w-full เพื่อให้พอดีกับ Grid */
              <div
                key={article.id}
                className="card bg-base-100 w-full shadow-sm"
              >
                <figure>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{article.title}</h2>
                  <p>{article.description}</p>
                  <div className="card-actions justify-end mt-4">
                    <Link
                      to={`/article/${article.id}`}
                      className="btn btn-primary btn-sm w-full md:w-auto"
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
