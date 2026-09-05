import { CheckCircle2 } from "lucide-react";
export const HeroSection = ({ bgimage }) => {
  return (
    <section className="relative" id="new">
      <img
        src={bgimage}
        alt="Two models wearing black and white minimal tailoring in a concrete studio"
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
            className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-foreground transition-opacity hover:opacity-85"
          >
            <CheckCircle2
              size={18}
              aria-hidden="true"
              className="shrink-0 text-accent"
            />
            <span>EXPLORE NOW</span>
          </a>
        </div>
      </div>
    </section>
  );
};
