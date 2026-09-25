import React from "react";

export const TextHomepage = ({ textheader, textdisc, className = "" }) => {
  return (
    <div className={`my-6 text-center md:text-left ${className}`}>
      <h3 className="text-center text-[1.45rem] font-extrabold tracking-[-0.04em] text-[#263639] md:text-left">
        {textheader}
      </h3>
      {textdisc && (
        <p className="text-center text-[0.95rem] font-semibold text-[#526164] md:text-left">
          {textdisc}
        </p>
      )}
    </div>
  );
};
