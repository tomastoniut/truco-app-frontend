interface CardDeckIconProps {
  size?: number;
  className?: string;
}

export const CardDeckIcon = ({ size = 80, className = '' }: CardDeckIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Card 3 (back) */}
      <rect
        x="38"
        y="22"
        width="35"
        height="50"
        rx="3"
        fill="#1e40af"
        stroke="#0ea5e9"
        strokeWidth="1.5"
        transform="rotate(8 55.5 47)"
      />
      
      {/* Card 2 (middle) */}
      <rect
        x="32"
        y="20"
        width="35"
        height="50"
        rx="3"
        fill="#2563eb"
        stroke="#0ea5e9"
        strokeWidth="1.5"
        transform="rotate(4 49.5 45)"
      />
      
      {/* Card 1 (front) - white with details */}
      <rect
        x="26"
        y="18"
        width="35"
        height="50"
        rx="3"
        fill="white"
        stroke="#10b981"
        strokeWidth="2"
      />
      
      {/* Card details - spade symbol */}
      <g transform="translate(43.5, 30)">
        {/* Spade */}
        <path
          d="M 0,-8 C -4,-5 -6,-2 -6,2 C -6,5 -4,7 0,7 C 4,7 6,5 6,2 C 6,-2 4,-5 0,-8 Z"
          fill="#10b981"
        />
        <path
          d="M -2,6 L 2,6 L 1,10 L -1,10 Z"
          fill="#10b981"
        />
      </g>
      
      {/* Corner symbol */}
      <text
        x="30"
        y="28"
        fontSize="8"
        fontWeight="bold"
        fill="#10b981"
        fontFamily="serif"
      >
        A
      </text>
      
      {/* Decorative pattern on cards */}
      <circle cx="48" cy="26" r="1" fill="#0ea5e9" opacity="0.6" />
      <circle cx="52" cy="24" r="1" fill="#0ea5e9" opacity="0.6" />
      <circle cx="56" cy="26" r="1" fill="#0ea5e9" opacity="0.6" />
    </svg>
  );
};
