import React from "react";
import { Link } from "react-router-dom";
import { normalizeImageUrl } from "../../utils/imageUtils.js";

export const OccasionLookSection = ({ looks = [] }) => {
  if (!looks || looks.length === 0) return null;

  return (
    <section className="my-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-primary">
          Occasion Look
        </h2>
        <Link to="/lookbook" className="text-sm font-bold text-accent hover:underline">
          ดูทุกลุค (Lookbook) &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {looks.map((look, idx) => {
          const imgUrl = normalizeImageUrl(look.image);
          const targetUrl = look.id ? `/lookbook/${look.id}` : "/lookbook";
          return (
            <Link
              key={look.id || idx}
              to={targetUrl}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0046a7] text-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl aspect-[3/4] p-3"
            >
              <div className="relative w-full flex-1 overflow-hidden rounded-xl bg-[#3b5377] flex items-center justify-center p-1 text-center">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={look.name || `Look ${idx + 1}`}
                    className="h-full w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide group-hover:scale-105 transition-transform">
                    {`Look ${idx + 1}`}
                  </h3>
                )}
              </div>
            <div className="pt-3 pb-1 flex items-center justify-between text-white">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  {look.nameTh || "เซ็ตชุดประจำวัน"}
                </span>
                <span className="text-[10px] text-white/70">
                  เซ็ต {look.items?.length || 2} ชิ้น
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-amber-200">
                  ฿{(look.setPrice || 1290).toLocaleString()}
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

export default OccasionLookSection;
