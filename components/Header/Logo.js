import React from "react";

const Logo = () => {
  return (
    <div className="paychain-logo-wrapper">
      <svg
        width="38"
        height="38"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="paychain-logo-svg"
      >
        {/* Sleek Outer Shield representing protection */}
        <path
          d="M20 37C20 37 35 30 35 18V8L20 3L5 8V18C5 30 20 37 20 37Z"
          stroke="#5163FF"
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill="#5163FF"
          fillOpacity="0.06"
        />
        {/* Inner Shield showing dual-layer security */}
        <path
          d="M20 31.5C20 31.5 30.5 26.5 30.5 17.5V10L20 6L9.5 10V17.5C9.5 26.5 20 31.5 20 31.5Z"
          stroke="#C586EE"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Clean, Bold Checkmark representing AI Fraud detection / Verification success */}
        <path
          d="M14 19L18 23L26 13"
          stroke="#10B981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Core AI scanner node in the checkmark base */}
        <circle cx="18" cy="23" r="3.5" fill="#34D399" />
      </svg>
      <span className="paychain-logo-text">
        PayChain <span className="theme-gradient">AI</span>
      </span>
    </div>
  );
};

export default Logo;
