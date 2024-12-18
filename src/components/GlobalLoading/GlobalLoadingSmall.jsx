import Lottie from "lottie-react";
import React from "react";
import loadingAnimation from "../../assets/animation/loadingAnimation.json";

function GlobalLoadingSmall({ isSubmiting, className = "" }) {
  return (
    <div
      className={`${
        isSubmiting ? "block" : "hidden"
      } absolute ${className}`}
    >
      <Lottie className="w-32 h-32" animationData={loadingAnimation} loop />
    </div>
  );
}

export default GlobalLoadingSmall;
