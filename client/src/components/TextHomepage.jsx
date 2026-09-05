import React from "react";

export const TextHomepage = ({ textheader, textdisc }) => {
  return (
    <div className="my-6 text-center text-primary sm:text-center md:text-left lg:text-left">
      <h3 className="text-center text-2xl font-bold md:text-left">
        {textheader}
      </h3>
      <p className="text-center font-semibold text-xl text-gray-700 md:text-left">
        {textdisc}
      </p>
    </div>
  );
};
