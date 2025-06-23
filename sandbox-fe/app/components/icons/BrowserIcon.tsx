import React from 'react';

interface IconProps {
  size?: number;
}

const MyIcon: React.FC<IconProps> = ({ size = 21 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: `${size}px`, minHeight: `${size}px` }}
    >
      <g filter="url(#filter0_ii_1527_83610)">
        <rect
          x="1.5"
          y="1.5"
          width="15"
          height="15"
          rx="7.5"
          fill="url(#paint0_linear_1527_83610)"
        />
      </g>
      <rect
        x="1.92857"
        y="1.92857"
        width="14.1429"
        height="14.1429"
        rx="7.07143"
        stroke="#B9B9B7"
        strokeWidth="0.857143"
      />
      <path
        d="M7.52172 7.76297C7.56208 7.65057 7.65057 7.56208 7.76297 7.52172L11.2014 6.28681C11.5197 6.17249 11.8274 6.48026 11.7131 6.79854L10.4776 10.2365C10.4373 10.3488 10.3488 10.4373 10.2365 10.4776L6.79854 11.7131C6.48026 11.8274 6.17249 11.5197 6.28681 11.2014L7.52172 7.76297Z"
        stroke="#535350"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        <filter
          id="filter0_ii_1527_83610"
          x="1"
          y="1"
          width="16"
          height="16"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" dy="1" />
          <feGaussianBlur stdDeviation="0.25" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1527_83610" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" dy="-1" />
          <feGaussianBlur stdDeviation="0.25" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_1527_83610"
            result="effect2_innerShadow_1527_83610"
          />
        </filter>

        <linearGradient
          id="paint0_linear_1527_83610"
          x1="9"
          y1="1.5"
          x2="9"
          y2="16.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopOpacity="0.16" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default MyIcon;
