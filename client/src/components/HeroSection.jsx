import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
export const HeroSection = ({ bgimage }) => {
  return (
    <section className="relative" id="new">
      <video
        src="/collection-2026/hero-media/Friends_comparing_clothing_in_café_20260916215659.mp4"
        alt="Two models wearing black and white minimal tailoring in a concrete studio"
        className="h-[78vh] w-full object-cover"
        autoPlay
        muted
        playsInline
        loop
      />
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/35 to-transparent">
        <div className="absolute w-full max-w-7xl px-6 pb-14">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white drop-shadow-md">
            Occasion AI Stylist
          </p>
          <h1 className="animate-gradient mt-4 max-w-3xl font-display text-5xl uppercase leading-[1.02] tracking-[0.02em] text-white drop-shadow-lg md:text-7xl">
            DRESS FOR EVERY OCCASION
          </h1>
          <p className="mt-8 text-[11px] uppercase tracking-[0.02em] text-white drop-shadow-md">
            เลือกเองหรือให้ AI แนะนำ — เซ็ตลุคที่แมตช์กับคุณ ทุกโอกาส ทุกสไตล์
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-foreground transition-opacity hover:opacity-85"
          >
            <CheckCircle2
              size={18}
              aria-hidden="true"
              className="shrink-0 text-accent"
            />
            <span>EXPLORE NOW</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
