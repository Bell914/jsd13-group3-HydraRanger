import React from "react";
import { assets } from "../assets/assets.js";
import MixAndMatchSection from "../components/MixAndMatchSection.jsx";

const MixAndMatchPage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <MixAndMatchSection assets={assets} />
    </div>
  );
};

export default MixAndMatchPage;